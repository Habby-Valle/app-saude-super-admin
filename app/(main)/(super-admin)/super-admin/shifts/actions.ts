"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { shiftFiltersSchema } from "@/lib/validations/shift"
import type { ShiftStatus } from "@/types/database"

function computeEffectiveStatus(
  dbStatus: string,
  progress: { total: number; completed: number }
): ShiftStatus {
  if (dbStatus === "completed" || dbStatus === "cancelled") return dbStatus as ShiftStatus
  const allDone = progress.total > 0 && progress.total === progress.completed
  return allDone ? "completed" : "in_progress"
}

export interface ShiftWithDetails {
  id: string
  clinic_id: string
  patient_id: string
  caregiver_id: string
  started_at: string
  ended_at: string | null
  status: ShiftStatus
  effective_status: ShiftStatus
  checklist_progress: { total: number; completed: number }
  patient_name: string
  caregiver_name: string
  clinic_name: string | null
}

export interface ShiftsResult {
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

export async function getShifts(raw: {
  search?: string
  status?: string
  clinicId?: string
  page?: number
  pageSize?: number
}): Promise<ShiftsResult> {
  const { supabase } = await requireSuperAdmin()

  const parsed = shiftFiltersSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { search = "", status = "all", page = 1, pageSize = 10 } = parsed.data
  const clinicId = raw.clinicId
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const selectAll = `
    id, clinic_id, patient_id, caregiver_id, started_at, ended_at, status,
    patient:patients(name),
    caregiver:users!caregiver_id(name),
    clinic:clinics(name)
  `

  let query = supabase
    .from("shifts")
    .select(selectAll, { count: "exact" })
    .order("started_at", { ascending: false })
    .range(from, to)

  if (status === "in_progress") {
    query = query.eq("status", "in_progress")
  } else if (status === "cancelled") {
    query = query.eq("status", "cancelled")
  } else if (status === "completed") {
    query = query.in("status", ["completed", "in_progress"])
  }

  if (clinicId && clinicId !== "all") {
    query = query.eq("clinic_id", clinicId)
  }

  const { data: rows, count, error } = await query

  if (error) {
    console.error("[getShifts] Supabase error:", error)
    throw new Error(error.message)
  }

  const shiftIds = (rows ?? []).map((r) => r.id)

  const checklistAggregates: Record<
    string,
    { total: number; completed: number }
  > = {}
  if (shiftIds.length > 0) {
    const { data: checklists } = await supabase
      .from("shift_checklists")
      .select("shift_id, status")
      .in("shift_id", shiftIds)

    for (const cl of checklists ?? []) {
      if (!checklistAggregates[cl.shift_id]) {
        checklistAggregates[cl.shift_id] = { total: 0, completed: 0 }
      }
      checklistAggregates[cl.shift_id].total++
      if (cl.status === "completed") {
        checklistAggregates[cl.shift_id].completed++
      }
    }
  }

  let shifts: ShiftWithDetails[] = (rows ?? []).map((row) => {
    const progress = checklistAggregates[row.id] ?? { total: 0, completed: 0 }
    return {
      id: row.id,
      clinic_id: row.clinic_id,
      patient_id: row.patient_id,
      caregiver_id: row.caregiver_id,
      started_at: row.started_at,
      ended_at: row.ended_at,
      status: row.status as ShiftStatus,
      effective_status: computeEffectiveStatus(row.status, progress),
      checklist_progress: progress,
      patient_name:
        (row.patient as unknown as { name: string } | null)?.name ?? "—",
      caregiver_name:
        (row.caregiver as unknown as { name: string } | null)?.name ?? "—",
      clinic_name:
        (row.clinic as unknown as { name: string } | null)?.name ?? null,
    }
  })

  if (status === "completed") {
    shifts = shifts.filter((s) => s.effective_status === "completed")
  }

  const filtered = search.trim()
    ? shifts.filter(
        (s) =>
          s.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          s.caregiver_name.toLowerCase().includes(search.toLowerCase()) ||
          (s.clinic_name ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : shifts

  return { shifts: filtered, total: count ?? 0 }
}

export async function getShiftById(
  id: string
): Promise<ShiftWithDetails | null> {
  const { supabase } = await requireSuperAdmin()

  const { data: row, error } = await supabase
    .from("shifts")
    .select(
      `
      id, clinic_id, patient_id, caregiver_id, started_at, ended_at, status,
      patient:patients(name),
      caregiver:users!caregiver_id(name),
      clinic:clinics(name)
    `
    )
    .eq("id", id)
    .single()

  if (error || !row) {
    console.error("[getShiftById] Supabase error:", error)
    return null
  }

  const { data: checklists } = await supabase
    .from("shift_checklists")
    .select("status")
    .eq("shift_id", id)

  const progress = {
    total: checklists?.length ?? 0,
    completed: checklists?.filter((c) => c.status === "completed").length ?? 0,
  }

  return {
    id: row.id,
    clinic_id: row.clinic_id,
    patient_id: row.patient_id,
    caregiver_id: row.caregiver_id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    status: row.status as ShiftStatus,
    effective_status: computeEffectiveStatus(row.status, progress),
    checklist_progress: progress,
    patient_name:
      (row.patient as unknown as { name: string } | null)?.name ?? "—",
    caregiver_name:
      (row.caregiver as unknown as { name: string } | null)?.name ?? "—",
    clinic_name:
      (row.clinic as unknown as { name: string } | null)?.name ?? null,
  }
}

export async function getShiftChecklist(
  shiftId: string
): Promise<
  { id: string; checklist_name: string; status: string; completed_at: string | null }[]
> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("shift_checklists")
    .select(
      "id, status, completed_at, checklist:checklists!checklist_id(name)"
    )
    .eq("shift_id", shiftId)
    .order("id", { ascending: false })

  if (error) {
    console.error("[getShiftChecklist] Supabase error:", error)
    return []
  }

  return (data ?? []).map((sc) => ({
    id: sc.id,
    checklist_name:
      (sc.checklist as unknown as { name: string } | null)?.name ?? "—",
    status: sc.status,
    completed_at: sc.completed_at,
  }))
}

export async function finishShift(
  id: string,
  justifications: { checklist_id: string; justification: string }[] = []
): Promise<FinishShiftResult> {
  try {
    const { supabase } = await requireSuperAdmin()

    const { data: shift, error: fetchError } = await supabase
      .from("shifts")
      .select("started_at")
      .eq("id", id)
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

    const { data: pendingChecklists } = await supabase
      .from("shift_checklists")
      .select("id, checklist:checklists!checklist_id(name)")
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
      })
      .eq("id", id)

    if (error) {
      console.error("[finishShift] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/super-admin/shifts")
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
    const { supabase } = await requireSuperAdmin()

    const { data: shift, error: fetchError } = await supabase
      .from("shifts")
      .select("started_at")
      .eq("id", id)
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

    if (error) {
      console.error("[cancelShift] error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/super-admin/shifts")
    return { success: true }
  } catch (err) {
    console.error("[cancelShift] unexpected error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    }
  }
}
