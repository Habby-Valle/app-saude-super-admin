"use server"

import { requireClinicAdmin } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import type { ShiftStatus } from "@/types/database"

const shiftFiltersSchema = z.object({
  search: z.string().optional().default(""),
  status: z
    .enum(["all", "in_progress", "completed", "cancelled"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

const createShiftSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),
  caregiver_id: z.string().uuid("Cuidador inválido"),
  started_at: z.string().min(1, "Data de início obrigatória"),
})

export interface ShiftWithDetails {
  id: string
  clinic_id: string
  patient_id: string
  caregiver_id: string
  started_at: string
  ended_at: string | null
  status: ShiftStatus
  patient_name: string
  caregiver_name: string
}

export interface ClinicShiftsResult {
  shifts: ShiftWithDetails[]
  total: number
}

export async function getClinicShifts(raw: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<ClinicShiftsResult> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const parsed = shiftFiltersSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { search = "", status = "all", page = 1, pageSize = 10 } = parsed.data
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("shifts")
    .select(
      `
      id, clinic_id, patient_id, caregiver_id, started_at, ended_at, status,
      patient:patients(name),
      caregiver:users(name)
    `,
      { count: "exact" }
    )
    .eq("clinic_id", clinicId)
    .order("started_at", { ascending: false })
    .range(from, to)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data: rows, count, error } = await query

  if (error) {
    console.error("[getClinicShifts] Supabase error:", error)
    throw new Error(error.message)
  }

  // Filtro de busca por nome (client-side após join)
  const shifts: ShiftWithDetails[] = (rows ?? []).map((row) => ({
    id: row.id,
    clinic_id: row.clinic_id,
    patient_id: row.patient_id,
    caregiver_id: row.caregiver_id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    status: row.status as ShiftStatus,
    patient_name:
      (row.patient as unknown as { name: string } | null)?.name ?? "—",
    caregiver_name:
      (row.caregiver as unknown as { name: string } | null)?.name ?? "—",
  }))

  // Filtro de busca em memória (nome de paciente ou cuidador)
  const filtered = search.trim()
    ? shifts.filter(
        (s) =>
          s.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          s.caregiver_name.toLowerCase().includes(search.toLowerCase())
      )
    : shifts

  return { shifts: filtered, total: count ?? 0 }
}

export interface SelectOption {
  id: string
  name: string
}

export async function getShiftSelectOptions(): Promise<{
  patients: SelectOption[]
}> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("patients")
    .select("id, name")
    .eq("clinic_id", clinicId)
    .order("name")

  if (error) {
    console.error("[getShiftSelectOptions] patients error:", error)
  }

  return {
    patients: (data ?? []).map((p) => ({ id: p.id, name: p.name as string })),
  }
}

export async function getCaregiversByPatient(
  patientId: string
): Promise<SelectOption[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

  // Busca os IDs dos cuidadores vinculados ao paciente
  const { data: links, error: linksError } = await supabase
    .from("caregiver_patient")
    .select("caregiver_id")
    .eq("patient_id", patientId)

  if (linksError || !links || links.length === 0) {
    return []
  }

  const caregiverIds = links.map((l) => l.caregiver_id)

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name")
    .in("id", caregiverIds)
    .eq("clinic_id", clinicId)
    .eq("role", "caregiver")
    .eq("status", "active")
    .order("name")

  if (usersError) {
    console.error("[getCaregiversByPatient] users error:", usersError)
    return []
  }

  return (users ?? []).map((u) => ({ id: u.id, name: u.name as string }))
}

export async function createShift(
  data: z.infer<typeof createShiftSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const parsed = createShiftSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { error } = await supabase.from("shifts").insert({
      clinic_id: clinicId,
      patient_id: parsed.data.patient_id,
      caregiver_id: parsed.data.caregiver_id,
      started_at: parsed.data.started_at,
      status: "in_progress",
    })

    if (error) {
      console.error("[createShift] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[createShift] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function finishShift(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    // Busca o turno para validar o horário de início antes de finalizar
    const { data: shift, error: fetchError } = await supabase
      .from("shifts")
      .select("started_at")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .eq("status", "in_progress")
      .single()

    if (fetchError || !shift) {
      return { success: false, error: "Turno não encontrado ou já encerrado." }
    }

    const now = new Date()
    if (now < new Date(shift.started_at)) {
      return {
        success: false,
        error: "Não é possível finalizar um turno antes do horário de início.",
      }
    }

    const { error } = await supabase
      .from("shifts")
      .update({ status: "completed", ended_at: now.toISOString() })
      .eq("id", id)
      .eq("clinic_id", clinicId)

    if (error) {
      console.error("[finishShift] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[finishShift] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function cancelShift(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    // Busca o turno para validar o horário de início antes de cancelar
    const { data: shift, error: fetchError } = await supabase
      .from("shifts")
      .select("started_at")
      .eq("id", id)
      .eq("clinic_id", clinicId)
      .eq("status", "in_progress")
      .single()

    if (fetchError || !shift) {
      return { success: false, error: "Turno não encontrado ou já encerrado." }
    }

    const now = new Date()
    if (now < new Date(shift.started_at)) {
      return {
        success: false,
        error: "Não é possível cancelar um turno antes do horário de início.",
      }
    }

    const { error } = await supabase
      .from("shifts")
      .update({ status: "cancelled", ended_at: now.toISOString() })
      .eq("id", id)
      .eq("clinic_id", clinicId)

    if (error) {
      console.error("[cancelShift] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[cancelShift] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}
