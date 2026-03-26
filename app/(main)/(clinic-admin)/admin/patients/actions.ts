"use server"

import { requireClinicAdmin } from "@/lib/auth"
import { z } from "zod"
import type { Patient } from "@/types/database"

const patientFiltersSchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

const createPatientSchema = z.object({
  name: z.string().min(2, "Nome precisa ter pelo menos 2 caracteres"),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida"),
  caregiver_ids: z.array(z.string()).optional().default([]),
})

export interface ClinicPatient extends Patient {
  caregiver_count: number
}

export interface ClinicPatientsResult {
  patients: ClinicPatient[]
  total: number
}

export async function getClinicPatients(raw: {
  search?: string
  page?: number
  pageSize?: number
}): Promise<ClinicPatientsResult> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const parsed = patientFiltersSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { search = "", page = 1, pageSize = 10 } = parsed.data
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  const { data: patients, count, error } = await query

  if (error) {
    console.error("[getClinicPatients] Supabase error:", error)
    throw new Error(error.message)
  }

  // Buscar TODOS os vínculos de uma vez (em vez de N queries)
  const patientIds = (patients ?? []).map((p) => p.id)
  const caregiverCounts: Record<string, number> = {}

  if (patientIds.length > 0) {
    const { data: allLinks } = await supabase
      .from("caregiver_patient")
      .select("patient_id")
      .in("patient_id", patientIds)

    allLinks?.forEach((link) => {
      caregiverCounts[link.patient_id] =
        (caregiverCounts[link.patient_id] || 0) + 1
    })
  }

  const patientsWithCount: ClinicPatient[] = (patients ?? []).map((p) => ({
    ...p,
    caregiver_count: caregiverCounts[p.id] || 0,
  }))

  return { patients: patientsWithCount, total: count ?? 0 }
}
export async function getClinicPatientById(
  id: string
): Promise<ClinicPatient | null> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .single()

  if (patientError || !patient) {
    return null
  }

  const { count: caregiverCount } = await supabase
    .from("caregiver_patient")
    .select("*", { count: "exact", head: true })
    .eq("patient_id", id)

  return {
    ...patient,
    caregiver_count: caregiverCount ?? 0,
  }
}

export interface PatientCaregiver {
  id: string
  name: string
  email: string
}

export async function getPatientCaregivers(
  patientId: string
): Promise<PatientCaregiver[]> {
  const { supabase } = await requireClinicAdmin()

  // Buscar os relacionamentos primeiro
  const { data: relations, error: relationsError } = await supabase
    .from("caregiver_patient")
    .select("caregiver_id")
    .eq("patient_id", patientId)

  if (relationsError) {
    console.error("[getPatientCaregivers] Relations error:", relationsError)
    return []
  }

  if (!relations || relations.length === 0) {
    return []
  }

  // Pegar os IDs dos cuidadores
  const caregiverIds = relations.map((r) => r.caregiver_id)

  // Buscar os dados dos cuidadores
  const { data: caregivers, error: caregiversError } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", caregiverIds)
    .order("name")

  if (caregiversError) {
    console.error("[getPatientCaregivers] Caregivers error:", caregiversError)
    return []
  }

  return (caregivers ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
  }))
}
export async function getClinicCaregivers(): Promise<PatientCaregiver[]> {
  const { supabase } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("role", "caregiver")
    .order("name")

  if (error) {
    console.error("[getClinicCaregivers] Supabase error:", error)
    return []
  }

  return (data ?? []).map((u) => ({
    id: u.id,
    name: u.name as string,
    email: u.email,
  }))
}

export async function createPatient(
  data: z.infer<typeof createPatientSchema>
): Promise<{ success: boolean; error?: string; patientId?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const parsed = createPatientSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { data: patientData, error: insertError } = await supabase
      .from("patients")
      .insert({
        name: parsed.data.name,
        birth_date: parsed.data.birth_date,
        clinic_id: clinicId,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("[createPatient] Insert error:", insertError)
      return { success: false, error: insertError.message }
    }

    if (parsed.data.caregiver_ids && parsed.data.caregiver_ids.length > 0) {
      const caregiverLinks = parsed.data.caregiver_ids.map((caregiverId) => ({
        caregiver_id: caregiverId,
        patient_id: patientData.id,
      }))

      const { error: linkError } = await supabase
        .from("caregiver_patient")
        .insert(caregiverLinks)

      if (linkError) {
        console.error("[createPatient] Link caregivers error:", linkError)
      }
    }

    return { success: true, patientId: patientData.id }
  } catch (err) {
    console.error("[createPatient] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function updatePatientCaregivers(
  patientId: string,
  caregiverIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireClinicAdmin()

    const { error: deleteError } = await supabase
      .from("caregiver_patient")
      .delete()
      .eq("patient_id", patientId)

    if (deleteError) {
      console.error("[updatePatientCaregivers] Delete error:", deleteError)
      return { success: false, error: deleteError.message }
    }

    if (caregiverIds.length > 0) {
      const caregiverLinks = caregiverIds.map((caregiverId) => ({
        caregiver_id: caregiverId,
        patient_id: patientId,
      }))

      const { error: insertError } = await supabase
        .from("caregiver_patient")
        .insert(caregiverLinks)

      if (insertError) {
        console.error("[updatePatientCaregivers] Insert error:", insertError)
        return { success: false, error: insertError.message }
      }
    }

    return { success: true }
  } catch (err) {
    console.error("[updatePatientCaregivers] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function updatePatient(
  id: string,
  data: Partial<z.infer<typeof createPatientSchema>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.birth_date !== undefined) updateData.birth_date = data.birth_date

    const { error: updateError } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .eq("clinic_id", clinicId)

    if (updateError) {
      console.error("[updatePatient] Update error:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[updatePatient] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function deletePatient(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const { error: deleteError } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)
      .eq("clinic_id", clinicId)

    if (deleteError) {
      console.error("[deletePatient] Delete error:", deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[deletePatient] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function exportClinicPatientsCsv(): Promise<string> {
  const { patients } = await getClinicPatients({ pageSize: 10000, page: 1 })

  const headers = ["Nome", "Nascimento", "Cuidadores", "Criado em"]
  const rows = patients.map((p) => [
    p.name,
    p.birth_date,
    String(p.caregiver_count),
    new Date(p.created_at).toLocaleDateString("pt-BR"),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

  return csv
}
