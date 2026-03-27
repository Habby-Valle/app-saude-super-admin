"use server"

import { revalidatePath } from "next/cache"
import { requireClinicAdmin } from "@/lib/auth"

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type SosStatus = "active" | "acknowledged" | "resolved"

export interface ClinicSosAlertWithDetails {
  id: string
  clinic_id: string
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

export interface ClinicSosAlertsResult {
  alerts: ClinicSosAlertWithDetails[]
  total: number
}

// ─── Listagem (Clinic Admin — escopo da própria clínica) ────────────────────

export async function getClinicSosAlerts(params: {
  status?: SosStatus | "all"
  page?: number
  pageSize?: number
}): Promise<ClinicSosAlertsResult> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { status = "all", page = 1, pageSize = 20 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("sos_alerts")
    .select(
      `
      *,
      patient:patients(name),
      triggerer:users!sos_alerts_triggered_by_fkey(name),
      acknowledger:users!sos_alerts_acknowledged_by_fkey(name),
      resolver:users!sos_alerts_resolved_by_fkey(name)
    `,
      { count: "exact" }
    )
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getClinicSosAlerts] Supabase error:", error)
    throw new Error(error.message)
  }

  const alerts: ClinicSosAlertWithDetails[] = (data ?? []).map((a) => ({
    ...a,
    patient_name: (a.patient as { name: string } | null)?.name ?? null,
    triggered_by_name: (a.triggerer as { name: string } | null)?.name ?? null,
    acknowledged_by_name: (a.acknowledger as { name: string } | null)?.name ?? null,
    resolved_by_name: (a.resolver as { name: string } | null)?.name ?? null,
  }))

  return { alerts, total: count ?? 0 }
}

export async function getClinicSosAlertById(
  id: string
): Promise<ClinicSosAlertWithDetails | null> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("sos_alerts")
    .select(
      `
      *,
      patient:patients(name),
      triggerer:users!sos_alerts_triggered_by_fkey(name),
      acknowledger:users!sos_alerts_acknowledged_by_fkey(name),
      resolver:users!sos_alerts_resolved_by_fkey(name)
    `
    )
    .eq("id", id)
    .eq("clinic_id", clinicId) // garante escopo da clínica
    .single()

  if (error || !data) return null

  return {
    ...data,
    patient_name: (data.patient as { name: string } | null)?.name ?? null,
    triggered_by_name: (data.triggerer as { name: string } | null)?.name ?? null,
    acknowledged_by_name: (data.acknowledger as { name: string } | null)?.name ?? null,
    resolved_by_name: (data.resolver as { name: string } | null)?.name ?? null,
  }
}

// ─── Mutações ────────────────────────────────────────────────────────────────

export async function acknowledgeClinicSosAlert(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, clinicId, user } = await requireClinicAdmin()

  const { error } = await supabase
    .from("sos_alerts")
    .update({
      status: "acknowledged",
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("clinic_id", clinicId) // garante escopo
    .eq("status", "active")    // só pode confirmar se ainda ativo

  if (error) {
    console.error("[acknowledgeClinicSosAlert] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/sos")
  return { success: true }
}

export async function resolveClinicSosAlert(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, clinicId, user } = await requireClinicAdmin()

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
    .eq("clinic_id", clinicId) // garante escopo
    .in("status", ["active", "acknowledged"])

  if (error) {
    console.error("[resolveClinicSosAlert] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/sos")
  return { success: true }
}

export async function getClinicSosSummary(): Promise<{
  active: number
  acknowledged: number
  resolvedToday: number
}> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  const { data } = await supabase
    .from("sos_alerts")
    .select("status, resolved_at")
    .eq("clinic_id", clinicId)

  const alerts = data ?? []

  return {
    active: alerts.filter((a) => a.status === "active").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolvedToday: alerts.filter(
      (a) => a.status === "resolved" && a.resolved_at && a.resolved_at >= todayStr
    ).length,
  }
}
