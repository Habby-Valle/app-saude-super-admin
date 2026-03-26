"use server"

import { requireSuperAdmin } from "@/lib/auth"
import type { Clinic } from "@/types/database"

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

export interface ClinicShiftsData {
  clinic_id: string
  clinic_name: string
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

export interface ReportSummary {
  totalShifts: number
  completedShifts: number
  cancelledShifts: number
  totalChecklistsCompleted: number
  totalPatients: number
  totalClinics: number
}

export async function getReportClinics(): Promise<
  Pick<Clinic, "id" | "name">[]
> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("[getReportClinics] Supabase error:", error)
    return []
  }

  return data ?? []
}

export async function getReportSummary(
  clinicId?: string
): Promise<ReportSummary> {
  const { supabase } = await requireSuperAdmin()

  let shiftsQuery = supabase.from("shifts").select("status", { count: "exact" })
  let checklistsQuery = supabase
    .from("shift_checklists")
    .select("status", { count: "exact" })
    .eq("status", "completed")
  let patientsQuery = supabase.from("patients").select("id", { count: "exact" })
  const clinicsQuery = supabase.from("clinics").select("id", { count: "exact" })

  if (clinicId && clinicId !== "all") {
    shiftsQuery = shiftsQuery.eq("clinic_id", clinicId)
    const shiftIds = await shiftIdsQuery(clinicId)
    checklistsQuery = checklistsQuery.in("shift_id", shiftIds)
    patientsQuery = patientsQuery.eq("clinic_id", clinicId)
  }

  const [
    { count: totalShifts },
    { count: completedChecklists },
    { count: totalPatients },
    { count: totalClinics },
  ] = await Promise.all([
    shiftsQuery,
    checklistsQuery,
    patientsQuery,
    clinicsQuery,
  ])

  return {
    totalShifts: totalShifts ?? 0,
    completedShifts: 0,
    cancelledShifts: 0,
    totalChecklistsCompleted: completedChecklists ?? 0,
    totalPatients: totalPatients ?? 0,
    totalClinics: totalClinics ?? 0,
  }
}

async function shiftIdsQuery(clinicId: string): Promise<string[]> {
  const { supabase } = await requireSuperAdmin()
  const { data } = await supabase
    .from("shifts")
    .select("id")
    .eq("clinic_id", clinicId)
  return (data ?? []).map((s) => s.id)
}

export async function getShiftsByPeriod(
  dateRange: DateRange,
  clinicId?: string
): Promise<ShiftsReportData[]> {
  const { supabase } = await requireSuperAdmin()

  let query = supabase
    .from("shifts")
    .select("started_at, status")
    .gte("started_at", dateRange.from)
    .lte("started_at", dateRange.to)

  if (clinicId && clinicId !== "all") {
    query = query.eq("clinic_id", clinicId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getShiftsByPeriod] Supabase error:", error)
    return []
  }

  const byDate = new Map<
    string,
    { total: number; completed: number; cancelled: number }
  >()

  for (const shift of data ?? []) {
    const date = shift.started_at.split("T")[0]
    const existing = byDate.get(date) ?? {
      total: 0,
      completed: 0,
      cancelled: 0,
    }
    existing.total++
    if (shift.status === "completed") existing.completed++
    if (shift.status === "cancelled") existing.cancelled++
    byDate.set(date, existing)
  }

  const sortedDates = Array.from(byDate.keys()).sort()
  return sortedDates.map((date) => ({
    date,
    ...byDate.get(date)!,
  }))
}

export async function getChecklistsByPeriod(
  dateRange: DateRange,
  clinicId?: string
): Promise<ChecklistsReportData[]> {
  const { supabase } = await requireSuperAdmin()

  let query = supabase
    .from("shift_checklists")
    .select("created_at, status")
    .gte("created_at", dateRange.from)
    .lte("created_at", dateRange.to)

  if (clinicId && clinicId !== "all") {
    query = query.in("shift_id", await shiftIdsQuery(clinicId))
  }

  const { data, error } = await query

  if (error) {
    console.error("[getChecklistsByPeriod] Supabase error:", error)
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
  return sortedDates.map((date) => ({
    date,
    ...byDate.get(date)!,
  }))
}

export async function getPatientsGrowth(
  months: number = 6,
  clinicId?: string
): Promise<PatientsGrowthData[]> {
  const { supabase } = await requireSuperAdmin()

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
  const startStr = startDate.toISOString().split("T")[0]

  let query = supabase
    .from("patients")
    .select("created_at")
    .gte("created_at", startStr)

  if (clinicId && clinicId !== "all") {
    query = query.eq("clinic_id", clinicId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getPatientsGrowth] Supabase error:", error)
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
    result.push({
      month: monthName,
      total: cumulative,
      new: newCount,
    })
  }

  return result
}

export async function getShiftsByClinic(
  dateRange: DateRange
): Promise<ClinicShiftsData[]> {
  const { supabase } = await requireSuperAdmin()

  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("status", "active")

  if (!clinics) return []

  const results: ClinicShiftsData[] = []

  for (const clinic of clinics) {
    const { data: shifts } = await supabase
      .from("shifts")
      .select("status")
      .eq("clinic_id", clinic.id)
      .gte("started_at", dateRange.from)
      .lte("started_at", dateRange.to)

    const clinicShifts = shifts ?? []
    results.push({
      clinic_id: clinic.id,
      clinic_name: clinic.name,
      total: clinicShifts.length,
      completed: clinicShifts.filter((s) => s.status === "completed").length,
      cancelled: clinicShifts.filter((s) => s.status === "cancelled").length,
    })
  }

  return results.sort((a, b) => b.total - a.total)
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
