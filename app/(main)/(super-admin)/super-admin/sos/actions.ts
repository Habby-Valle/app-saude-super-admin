"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type SosStatus = "active" | "acknowledged" | "resolved"

export interface SosAlertWithDetails {
  id: string
  clinic_id: string
  clinic_name: string | null
  patient_id: string
  patient_name: string | null
  triggered_by: string
  triggered_by_name: string | null
  status: SosStatus
  location_lat: number | null
  location_lng: number | null
  notes: string | null
  acknowledged_by: string | null
  acknowledged_by_name: string | null
  acknowledged_at: string | null
  resolved_by: string | null
  resolved_by_name: string | null
  resolved_at: string | null
  created_at: string
}

export interface SosAlertsResult {
  alerts: SosAlertWithDetails[]
  total: number
}

// ─── Listagem global (Super Admin) ──────────────────────────────────────────

export async function getSosAlerts(params: {
  status?: SosStatus | "all"
  clinicId?: string
  page?: number
  pageSize?: number
}): Promise<SosAlertsResult> {
  const { supabase } = await requireSuperAdmin()

  const { status = "all", clinicId, page = 1, pageSize = 20 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("sos_alerts")
    .select(
      `
      *,
      clinic:clinics(name),
      patient:patients(name),
      triggerer:users!sos_alerts_triggered_by_fkey(name),
      acknowledger:users!sos_alerts_acknowledged_by_fkey(name),
      resolver:users!sos_alerts_resolved_by_fkey(name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (clinicId && clinicId !== "all") {
    query = query.eq("clinic_id", clinicId)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getSosAlerts] Supabase error:", error)
    throw new Error(error.message)
  }

  const alerts: SosAlertWithDetails[] = (data ?? []).map((a) => ({
    ...a,
    clinic_name: (a.clinic as { name: string } | null)?.name ?? null,
    patient_name: (a.patient as { name: string } | null)?.name ?? null,
    triggered_by_name: (a.triggerer as { name: string } | null)?.name ?? null,
    acknowledged_by_name: (a.acknowledger as { name: string } | null)?.name ?? null,
    resolved_by_name: (a.resolver as { name: string } | null)?.name ?? null,
  }))

  return { alerts, total: count ?? 0 }
}

export async function getSosAlertById(
  id: string
): Promise<SosAlertWithDetails | null> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("sos_alerts")
    .select(
      `
      *,
      clinic:clinics(name),
      patient:patients(name),
      triggerer:users!sos_alerts_triggered_by_fkey(name),
      acknowledger:users!sos_alerts_acknowledged_by_fkey(name),
      resolver:users!sos_alerts_resolved_by_fkey(name)
    `
    )
    .eq("id", id)
    .single()

  if (error || !data) return null

  return {
    ...data,
    clinic_name: (data.clinic as { name: string } | null)?.name ?? null,
    patient_name: (data.patient as { name: string } | null)?.name ?? null,
    triggered_by_name: (data.triggerer as { name: string } | null)?.name ?? null,
    acknowledged_by_name: (data.acknowledger as { name: string } | null)?.name ?? null,
    resolved_by_name: (data.resolver as { name: string } | null)?.name ?? null,
  }
}

// ─── Mutações (compartilhadas — Super Admin usa service role implícito via RLS) ──

export async function acknowledgeSosAlert(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireSuperAdmin()

  const { error } = await supabase
    .from("sos_alerts")
    .update({
      status: "acknowledged",
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "active") // só pode confirmar se ainda ativo

  if (error) {
    console.error("[acknowledgeSosAlert] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/super-admin/sos")
  return { success: true }
}

export async function resolveSosAlert(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireSuperAdmin()

  const updateData: Record<string, unknown> = {
    status: "resolved",
    resolved_by: user.id,
    resolved_at: new Date().toISOString(),
  }
  if (notes) updateData.notes = notes

  const { error } = await supabase
    .from("sos_alerts")
    .update(updateData)
    .eq("id", id)
    .in("status", ["active", "acknowledged"]) // pode resolver de qualquer estado não-resolvido

  if (error) {
    console.error("[resolveSosAlert] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/super-admin/sos")
  return { success: true }
}

export async function getSosSummary(clinicId?: string): Promise<{
  active: number
  acknowledged: number
  resolvedToday: number
}> {
  const { supabase } = await requireSuperAdmin()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  let baseQuery = supabase.from("sos_alerts").select("status, resolved_at")

  if (clinicId && clinicId !== "all") {
    baseQuery = baseQuery.eq("clinic_id", clinicId)
  }

  const { data } = await baseQuery

  const alerts = data ?? []

  return {
    active: alerts.filter((a) => a.status === "active").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolvedToday: alerts.filter(
      (a) => a.status === "resolved" && a.resolved_at && a.resolved_at >= todayStr
    ).length,
  }
}
