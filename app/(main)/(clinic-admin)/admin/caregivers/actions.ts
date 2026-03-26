"use server"

import { requireClinicAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { z } from "zod"
import type { User } from "@/types/database"

const caregiverFiltersSchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

const createCaregiverSchema = z.object({
  name: z.string().min(2, "Nome precisa ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
})

export interface ClinicCaregiver extends User {
  patient_count: number
}

export interface ClinicCaregiversResult {
  caregivers: ClinicCaregiver[]
  total: number
}

export async function getClinicCaregivers(raw: {
  search?: string
  page?: number
  pageSize?: number
}): Promise<ClinicCaregiversResult> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const parsed = caregiverFiltersSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { search = "", page = 1, pageSize = 10 } = parsed.data
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("clinic_id", clinicId)
    .eq("role", "caregiver")
    .order("name")
    .range(from, to)

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
    )
  }

  const { data: caregivers, count, error } = await query

  if (error) {
    console.error("[getClinicCaregivers] Supabase error:", error)
    throw new Error(error.message)
  }

  // Buscar TODOS os vínculos de uma vez (em vez de N queries)
  const caregiverIds = (caregivers ?? []).map((c) => c.id)
  const patientCounts: Record<string, number> = {}

  if (caregiverIds.length > 0) {
    const { data: allLinks } = await supabase
      .from("caregiver_patient")
      .select("caregiver_id")
      .in("caregiver_id", caregiverIds)

    allLinks?.forEach((link) => {
      patientCounts[link.caregiver_id] =
        (patientCounts[link.caregiver_id] || 0) + 1
    })
  }

  const caregiversWithCount: ClinicCaregiver[] = (caregivers ?? []).map(
    (c) => ({
      ...c,
      patient_count: patientCounts[c.id] || 0,
    })
  )

  return { caregivers: caregiversWithCount, total: count ?? 0 }
}

export async function getClinicCaregiverById(
  id: string
): Promise<ClinicCaregiver | null> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data: caregiver, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .eq("role", "caregiver")
    .single()

  if (error || !caregiver) {
    return null
  }

  const { count: patientCount } = await supabase
    .from("caregiver_patient")
    .select("*", { count: "exact", head: true })
    .eq("caregiver_id", id)

  return {
    ...caregiver,
    patient_count: patientCount ?? 0,
  }
}

export interface CaregiverPatient {
  id: string
  name: string
  birth_date: string
}

export async function getCaregiverPatients(
  caregiverId: string
): Promise<CaregiverPatient[]> {
  const { supabase } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("caregiver_patient")
    .select(
      `
      patient:patients(id, name, birth_date)
    `
    )
    .eq("caregiver_id", caregiverId)

  if (error) {
    console.error("[getCaregiverPatients] Supabase error:", error)
    return []
  }

  return (data ?? [])
    .map(
      (cp) =>
        cp.patient as unknown as {
          id: string
          name: string
          birth_date: string
        } | null
    )
    .filter((p): p is CaregiverPatient => p !== null)
}

export async function createCaregiver(
  data: z.infer<typeof createCaregiverSchema>
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()
    const adminClient = createAdminClient()

    const parsed = createCaregiverSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { data: authData, error: signUpError } =
      await adminClient.auth.admin.createUser({
        email: parsed.data.email,
        email_confirm: true,
        user_metadata: {
          name: parsed.data.name,
          role: "caregiver",
          clinic_id: clinicId,
        },
      })

    if (signUpError || !authData.user) {
      console.error("[createCaregiver] SignUp error:", signUpError)
      return {
        success: false,
        error: signUpError?.message ?? "Erro ao criar usuário",
      }
    }

    const { error: updateError } = await adminClient
      .from("users")
      .update({
        name: parsed.data.name,
        clinic_id: clinicId,
        role: "caregiver",
        status: "active",
      })
      .eq("id", authData.user.id)

    if (updateError) {
      console.error("[createCaregiver] Update error:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, userId: authData.user.id }
  } catch (err) {
    console.error("[createCaregiver] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function updateCaregiver(
  id: string,
  data: Partial<z.infer<typeof createCaregiverSchema>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name

    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .eq("role", "caregiver")

    if (updateError) {
      console.error("[updateCaregiver] Update error:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[updateCaregiver] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function deleteCaregiver(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const { error: deleteLinksError } = await supabase
      .from("caregiver_patient")
      .delete()
      .eq("caregiver_id", id)

    if (deleteLinksError) {
      console.error("[deleteCaregiver] Delete links error:", deleteLinksError)
    }

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .eq("role", "caregiver")

    if (deleteError) {
      console.error("[deleteCaregiver] Delete error:", deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[deleteCaregiver] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function setCaregiverPassword(
  userId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireClinicAdmin()
    const adminClient = createAdminClient()

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password,
    })

    if (error) {
      console.error("[setCaregiverPassword] Error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[setCaregiverPassword] Unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}
