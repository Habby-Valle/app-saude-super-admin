"use server"

import { requireClinicAdmin } from "@/lib/auth"

export interface DateRange {
  from: string
  to: string
}

export interface ShiftsReportData {
  date: string
  total: number
  completed: number
  cancelled: number
}

export interface ChecklistsReportData {
  date: string
  completed: number
  pending: number
}

export interface PatientsGrowthData {
  month: string
  total: number
  new: number
}

export interface ClinicReportSummary {
  totalShifts: number
  completedShifts: number
  cancelledShifts: number
  totalChecklistsCompleted: number
  totalPatients: number
  totalCaregivers: number
}

export async function getClinicReportSummary(): Promise<ClinicReportSummary> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const [
    { count: totalShifts },
    { count: completedShifts },
    { count: cancelledShifts },
    { count: totalPatients },
    { count: totalCaregivers },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId),
    supabase
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "completed"),
    supabase
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "cancelled"),
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("role", "caregiver")
      .eq("status", "active"),
  ])

  // Checklists concluídos (via shift_ids da clínica)
  const { data: shiftIds } = await supabase
    .from("shifts")
    .select("id")
    .eq("clinic_id", clinicId)

  let totalChecklistsCompleted = 0
  if (shiftIds && shiftIds.length > 0) {
    const { count } = await supabase
      .from("shift_checklists")
      .select("id", { count: "exact", head: true })
      .in(
        "shift_id",
        shiftIds.map((s) => s.id)
      )
      .eq("status", "completed")
    totalChecklistsCompleted = count ?? 0
  }

  return {
    totalShifts: totalShifts ?? 0,
    completedShifts: completedShifts ?? 0,
    cancelledShifts: cancelledShifts ?? 0,
    totalChecklistsCompleted,
    totalPatients: totalPatients ?? 0,
    totalCaregivers: totalCaregivers ?? 0,
  }
}

export async function getClinicShiftsByPeriod(
  dateRange: DateRange
): Promise<ShiftsReportData[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("shifts")
    .select("started_at, status")
    .eq("clinic_id", clinicId)
    .gte("started_at", dateRange.from)
    .lte("started_at", dateRange.to)

  if (error) {
    console.error("[getClinicShiftsByPeriod] Supabase error:", error)
    return []
  }

  const byDate = new Map<
    string,
    { total: number; completed: number; cancelled: number }
  >()

  for (const shift of data ?? []) {
    const date = shift.started_at.split("T")[0]
    const existing = byDate.get(date) ?? { total: 0, completed: 0, cancelled: 0 }
    existing.total++
    if (shift.status === "completed") existing.completed++
    if (shift.status === "cancelled") existing.cancelled++
    byDate.set(date, existing)
  }

  const sortedDates = Array.from(byDate.keys()).sort()
  return sortedDates.map((date) => ({ date, ...byDate.get(date)! }))
}

export async function getClinicChecklistsByPeriod(
  dateRange: DateRange
): Promise<ChecklistsReportData[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data: shiftIds } = await supabase
    .from("shifts")
    .select("id")
    .eq("clinic_id", clinicId)

  if (!shiftIds || shiftIds.length === 0) return []

  const { data, error } = await supabase
    .from("shift_checklists")
    .select("created_at, status")
    .in(
      "shift_id",
      shiftIds.map((s) => s.id)
    )
    .gte("created_at", dateRange.from)
    .lte("created_at", dateRange.to)

  if (error) {
    console.error("[getClinicChecklistsByPeriod] Supabase error:", error)
    return []
  }

  const byDate = new Map<string, { completed: number; pending: number }>()

  for (const cl of data ?? []) {
    const date = cl.created_at.split("T")[0]
    const existing = byDate.get(date) ?? { completed: 0, pending: 0 }
    if (cl.status === "completed") existing.completed++
    else existing.pending++
    byDate.set(date, existing)
  }

  const sortedDates = Array.from(byDate.keys()).sort()
  return sortedDates.map((date) => ({ date, ...byDate.get(date)! }))
}

export async function getClinicPatientsGrowth(
  months: number = 6
): Promise<PatientsGrowthData[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
  const startStr = startDate.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("patients")
    .select("created_at")
    .eq("clinic_id", clinicId)
    .gte("created_at", startStr)

  if (error) {
    console.error("[getClinicPatientsGrowth] Supabase error:", error)
    return []
  }

  const monthlyData = new Map<string, number>()

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthlyData.set(key, 0)
  }

  for (const patient of data ?? []) {
    const d = new Date(patient.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (monthlyData.has(key)) {
      monthlyData.set(key, (monthlyData.get(key) ?? 0) + 1)
    }
  }

  let cumulative = 0
  const result: PatientsGrowthData[] = []

  for (const [month, newCount] of monthlyData) {
    cumulative += newCount
    const [year, m] = month.split("-")
    const monthName = new Date(
      parseInt(year),
      parseInt(m) - 1
    ).toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    })
    result.push({ month: monthName, total: cumulative, new: newCount })
  }

  return result
}

export async function exportToCsv(
  headers: string[],
  rows: string[][]
): Promise<string> {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const headerRow = headers.map(escape).join(",")
  const dataRows = rows.map((row) => row.map(escape).join(","))
  return [headerRow, ...dataRows].join("\n")
}
