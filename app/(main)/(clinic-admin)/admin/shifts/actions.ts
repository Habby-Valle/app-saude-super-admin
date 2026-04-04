"use server"

import { requireClinicAdmin } from "@/lib/auth"
import {
  createShiftTemplateSchema,
  updateShiftTemplateSchema,
  createShiftSchema,
  shiftFiltersSchema,
} from "@/lib/validations/shift"
import { revalidatePath } from "next/cache"
import type { ShiftStatus } from "@/types/database"

export interface ShiftTemplate {
  id: string
  clinic_id: string
  name: string
  start_time: string
  end_time: string
  instructions: string | null
  is_active: boolean
  created_at: string
}

export interface ShiftCheckpoint {
  id: string
  shift_id: string
  caregiver_id: string
  caregiver_name: string
  notes: string | null
  checked_at: string
}

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
  instructions: string | null
  last_checkpoint_at: string | null
  completed_with_justification: boolean
}

export interface ClinicShiftsResult {
  shifts: ShiftWithDetails[]
  total: number
}

export interface PendingChecklist {
  id: string
  name: string
}

export interface FinishShiftResult {
  success: boolean
  error?: string
  hasPendingChecklists?: boolean
  pendingChecklists?: PendingChecklist[]
}

export interface SelectOption {
  id: string
  name: string
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
      id, clinic_id, patient_id, caregiver_id, started_at, ended_at, status, instructions, last_checkpoint_at, completed_with_justification,
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
    instructions: row.instructions,
    last_checkpoint_at: row.last_checkpoint_at,
    completed_with_justification: row.completed_with_justification ?? false,
  }))

  const filtered = search.trim()
    ? shifts.filter(
        (s) =>
          s.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          s.caregiver_name.toLowerCase().includes(search.toLowerCase())
      )
    : shifts

  return { shifts: filtered, total: count ?? 0 }
}

export async function getShiftSelectOptions(): Promise<{
  patients: SelectOption[]
  templates: SelectOption[]
}> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const [patientsRes, templatesRes] = await Promise.all([
    supabase
      .from("patients")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .order("name"),
    supabase
      .from("shift_templates")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .order("name"),
  ])

  return {
    patients: (patientsRes.data ?? []).map((p) => ({
      id: p.id,
      name: p.name as string,
    })),
    templates: (templatesRes.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
    })),
  }
}

export async function getShiftTemplates(): Promise<ShiftTemplate[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("shift_templates")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("name")

  if (error) {
    console.error("[getShiftTemplates] error:", error)
    return []
  }

  return (data ?? []) as ShiftTemplate[]
}

export async function getCaregiversByPatient(
  patientId: string
): Promise<SelectOption[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

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

export async function createShift(data: {
  patient_id: string
  caregiver_id: string
  started_at: string
  template_id?: string
  instructions?: string
}): Promise<{ success: boolean; error?: string }> {
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
      instructions: parsed.data.instructions ?? null,
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

export async function createShiftTemplate(data: {
  name: string
  start_time: string
  end_time: string
  instructions?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const parsed = createShiftTemplateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { error } = await supabase.from("shift_templates").insert({
      clinic_id: clinicId,
      name: parsed.data.name,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      instructions: parsed.data.instructions ?? null,
    })

    if (error) {
      console.error("[createShiftTemplate] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[createShiftTemplate] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function updateShiftTemplate(data: {
  id: string
  name: string
  start_time: string
  end_time: string
  instructions?: string
  is_active: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const parsed = updateShiftTemplateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
      .from("shift_templates")
      .update({
        name: parsed.data.name,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
        instructions: parsed.data.instructions ?? null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id)
      .eq("clinic_id", clinicId)

    if (error) {
      console.error("[updateShiftTemplate] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[updateShiftTemplate] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function deleteShiftTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

    const { error } = await supabase
      .from("shift_templates")
      .delete()
      .eq("id", id)
      .eq("clinic_id", clinicId)

    if (error) {
      console.error("[deleteShiftTemplate] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[deleteShiftTemplate] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function finishShift(
  id: string,
  justifications: { checklist_id: string; justification: string }[] = []
): Promise<FinishShiftResult> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()

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

    // Verificar checklists pendentes
    const { data: pendingChecklists } = await supabase
      .from("shift_checklists")
      .select("id, checklist:checklists(name)")
      .eq("shift_id", id)
      .eq("status", "pending")

    const pendingList = (pendingChecklists ?? []).map((c) => ({
      id: c.id,
      name:
        (c.checklist as unknown as { name: string } | null)?.name ??
        "Checklist",
    }))

    if (pendingList.length > 0) {
      if (justifications.length === 0) {
        return {
          success: false,
          error: "Existem checklists pendentes",
          hasPendingChecklists: true,
          pendingChecklists: pendingList,
        }
      }

      // Salvar justificativas
      for (const just of justifications) {
        await supabase
          .from("shift_checklists")
          .update({ justification: just.justification })
          .eq("id", just.checklist_id)
      }
    }

    const { error } = await supabase
      .from("shifts")
      .update({
        status: "completed",
        ended_at: now.toISOString(),
        completed_with_justification: justifications.length > 0,
      })
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

export async function createCheckpoint(
  shiftId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, clinicId, user } = await requireClinicAdmin()

    // Verificar se o turno existe e está em andamento
    const { data: shift, error: shiftError } = await supabase
      .from("shifts")
      .select("id, status")
      .eq("id", shiftId)
      .eq("clinic_id", clinicId)
      .eq("status", "in_progress")
      .single()

    if (shiftError || !shift) {
      return { success: false, error: "Turno não encontrado ou já encerrado." }
    }

    const now = new Date()
    const { error } = await supabase.from("shift_checkpoints").insert({
      shift_id: shiftId,
      caregiver_id: user.id,
      notes: notes ?? null,
      checked_at: now.toISOString(),
    })

    if (error) {
      console.error("[createCheckpoint] error:", error)
      return { success: false, error: error.message }
    }

    // Atualizar last_checkpoint_at no turno
    await supabase
      .from("shifts")
      .update({ last_checkpoint_at: now.toISOString() })
      .eq("id", shiftId)

    revalidatePath("/admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[createCheckpoint] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}

export async function getShiftCheckpoints(
  shiftId: string
): Promise<ShiftCheckpoint[]> {
  const { supabase } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("shift_checkpoints")
    .select(
      `
      id, shift_id, caregiver_id, notes, checked_at,
      caregiver:users(name)
    `
    )
    .eq("shift_id", shiftId)
    .order("checked_at", { ascending: false })

  if (error) {
    console.error("[getShiftCheckpoints] error:", error)
    return []
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    shift_id: c.shift_id,
    caregiver_id: c.caregiver_id,
    caregiver_name:
      (c.caregiver as unknown as { name: string } | null)?.name ?? "—",
    notes: c.notes,
    checked_at: c.checked_at,
  }))
}
