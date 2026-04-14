"use server"

import { requireSuperAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { logAuditEvent } from "../audit-logs/actions"
import type { Plan } from "@/types/database"

export interface SubscriptionWithClinic {
  id: string
  clinicId: string
  clinicName: string
  clinicEmail: string
  planId: string
  planName: string
  planPrice: number
  planBillingCycle: string
  status: string
  startedAt: string
  expiresAt: string
  trialEndsAt: string | null
  daysRemaining: number | null
}

export async function getAllSubscriptions(): Promise<SubscriptionWithClinic[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("clinic_plans")
    .select(
      `
      id,
      clinic_id,
      plan_id,
      status,
      started_at,
      expires_at,
      trial_ends_at,
      clinics (
        id,
        name,
        email
      ),
      plans (
        id,
        name,
        price,
        billing_cycle
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAllSubscriptions] Error:", error)
    return []
  }

  const now = new Date()

  const subscriptions: SubscriptionWithClinic[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>
    const expiresAt = new Date(r.expires_at as string)
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      id: r.id as string,
      clinicId: r.clinic_id as string,
      clinicName:
        (r.clinics as Record<string, string> | undefined)?.name ??
        "Clínica sem nome",
      clinicEmail:
        (r.clinics as Record<string, string> | undefined)?.email ?? "",
      planId: r.plan_id as string,
      planName:
        ((r.plans as Record<string, string | number> | undefined)
          ?.name as string) ?? "Plano não encontrado",
      planPrice:
        ((r.plans as Record<string, string | number> | undefined)
          ?.price as number) ?? 0,
      planBillingCycle:
        (r.plans as Record<string, string> | undefined)?.billing_cycle ??
        "monthly",
      status: r.status as string,
      startedAt: r.started_at as string,
      expiresAt: r.expires_at as string,
      trialEndsAt: r.trial_ends_at as string | null,
      daysRemaining:
        r.status === "active" || r.status === "trial" ? daysRemaining : null,
    }
  })

  return subscriptions
}

export async function getSubscriptionStats() {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase.from("clinic_plans").select("status")

  if (error) {
    console.error("[getSubscriptionStats] Error:", error)
    return { total: 0, active: 0, trial: 0, expired: 0, cancelled: 0 }
  }

  const stats = {
    total: data?.length ?? 0,
    active: data?.filter((r) => r.status === "active").length ?? 0,
    trial: data?.filter((r) => r.status === "trial").length ?? 0,
    expired: data?.filter((r) => r.status === "expired").length ?? 0,
    cancelled: data?.filter((r) => r.status === "cancelled").length ?? 0,
  }

  return stats
}

export async function getAvailablePlansForActivation(): Promise<Plan[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[getAvailablePlansForActivation] Error:", error)
    return []
  }

  return data ?? []
}

interface ActivateSubscriptionParams {
  subscriptionId: string
  planId: string
  billingCycle: "monthly" | "quarterly" | "annual"
  startedAt?: string
  notes?: string
}

export async function activateSubscriptionManual(
  params: ActivateSubscriptionParams
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()
  const { subscriptionId, planId, billingCycle, startedAt, notes } = params

  const startDate = startedAt ? new Date(startedAt) : new Date()
  const expiresDate = new Date(startDate)

  switch (billingCycle) {
    case "monthly":
      expiresDate.setMonth(expiresDate.getMonth() + 1)
      break
    case "quarterly":
      expiresDate.setMonth(expiresDate.getMonth() + 3)
      break
    case "annual":
      expiresDate.setFullYear(expiresDate.getFullYear() + 1)
      break
  }

  const { error: updateError } = await supabase
    .from("clinic_plans")
    .update({
      status: "active",
      plan_id: planId,
      started_at: startDate.toISOString(),
      expires_at: expiresDate.toISOString(),
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)

  if (updateError) {
    console.error("[activateSubscriptionManual] Error:", updateError)
    return { success: false, error: "Erro ao ativar assinatura" }
  }

  if (notes) {
    console.log("[activateSubscriptionManual] Notes:", notes)
  }

  await logAuditEvent("activate", "subscription", subscriptionId, {
    plan_id: planId,
    billing_cycle: billingCycle,
    notes,
  }).catch(console.error)

  return { success: true }
}

interface ExtendTrialParams {
  subscriptionId: string
  daysToAdd: number
}

export async function extendTrial(
  params: ExtendTrialParams
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()
  const admin = createAdminClient()
  const { subscriptionId, daysToAdd } = params

  console.log(
    "[extendTrial] subscriptionId:",
    subscriptionId,
    "daysToAdd:",
    daysToAdd
  )

  const { data: current, error: fetchError } = await admin
    .from("clinic_plans")
    .select("expires_at, trial_ends_at, status")
    .eq("id", subscriptionId)
    .single()

  if (fetchError || !current) {
    return { success: false, error: "Assinatura não encontrada" }
  }

  console.log("[extendTrial] current:", current)

  const currentExpiresAt = new Date(current.expires_at || current.trial_ends_at)
  const newExpiresAt = new Date(
    currentExpiresAt.getTime() + daysToAdd * 24 * 60 * 60 * 1000
  )

  console.log("[extendTrial] newExpiresAt:", newExpiresAt.toISOString())

  const { error: updateError } = await admin
    .from("clinic_plans")
    .update({
      expires_at: newExpiresAt.toISOString(),
      trial_ends_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)

  if (updateError) {
    console.error("[extendTrial] Error:", updateError)
    return { success: false, error: "Erro ao estender Trial" }
  }

  await logAuditEvent("extend_trial", "subscription", subscriptionId, {
    days_added: daysToAdd,
  }).catch(console.error)

  console.log("[extendTrial] Extended trial by", daysToAdd, "days")
  return { success: true }
}

interface UpdateSubscriptionDatesParams {
  subscriptionId: string
  startsAt: string
  expiresAt: string
}

export async function updateSubscriptionDates(
  params: UpdateSubscriptionDatesParams
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()
  const admin = createAdminClient()
  const { subscriptionId, startsAt, expiresAt } = params

  const { error: updateError } = await admin
    .from("clinic_plans")
    .update({
      started_at: startsAt,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)

  if (updateError) {
    console.error("[updateSubscriptionDates] Error:", updateError)
    return { success: false, error: "Erro ao atualizar datas" }
  }

  await logAuditEvent("update_dates", "subscription", subscriptionId, {
    started_at: startsAt,
    expires_at: expiresAt,
  }).catch(console.error)

  return { success: true }
}

export async function getSubscriptionHistory(subscriptionId: string) {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity", "subscription")
    .eq("entity_id", subscriptionId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[getSubscriptionHistory] Error:", error)
    return []
  }

  return data ?? []
}

export interface SubscriptionStatusInfo {
  status: string
  daysUntilExpiry: number | null
  paymentPastDue: boolean
  paymentFailed: boolean
  gracePeriodDaysRemaining: number | null
}

export async function getClinicSubscriptionStatusInfo(
  clinicId: string
): Promise<SubscriptionStatusInfo | null> {
  const admin = createAdminClient()

  const { data: clinicPlan, error } = await admin
    .from("clinic_plans")
    .select("status, expires_at, payment_failed_at")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"])
    .single()

  if (error || !clinicPlan) {
    return null
  }

  const now = new Date()
  const expiresAt = new Date(clinicPlan.expires_at)
  const daysUntilExpiry = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const paymentFailedAt = clinicPlan.payment_failed_at
    ? new Date(clinicPlan.payment_failed_at)
    : null
  const paymentFailed = paymentFailedAt !== null
  const daysSincePaymentFailed = paymentFailedAt
    ? Math.ceil(
        (now.getTime() - paymentFailedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  const gracePeriodDaysRemaining =
    paymentFailed && daysSincePaymentFailed < 7
      ? 7 - daysSincePaymentFailed
      : null

  return {
    status: clinicPlan.status,
    daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
    paymentPastDue: paymentFailed && daysSincePaymentFailed >= 7,
    paymentFailed: paymentFailed && daysSincePaymentFailed >= 7,
    gracePeriodDaysRemaining,
  }
}

export async function markSubscriptionPaymentFailed(
  clinicId: string
): Promise<{ success: boolean }> {
  const admin = createAdminClient()

  const { error } = await admin
    .from("clinic_plans")
    .update({
      payment_failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("clinic_id", clinicId)
    .eq("status", "active")

  if (error) {
    console.error("[markSubscriptionPaymentFailed] Error:", error)
    return { success: false }
  }

  await logAuditEvent("payment_failed", "subscription", clinicId, {}).catch(
    console.error
  )

  return { success: true }
}

export async function blockSubscriptionsWithFailedPayment(
  daysThreshold: number = 7
): Promise<number> {
  const admin = createAdminClient()

  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  const { data: expiredSubscriptions, error } = await admin
    .from("clinic_plans")
    .select("id, clinic_id")
    .eq("status", "active")
    .not("payment_failed_at", "is", null)
    .lt("payment_failed_at", thresholdDate.toISOString())

  if (error) {
    console.error("[blockSubscriptionsWithFailedPayment] Error:", error)
    return 0
  }

  if (!expiredSubscriptions?.length) {
    return 0
  }

  let blockedCount = 0

  for (const sub of expiredSubscriptions) {
    // Cancel current subscription
    await admin
      .from("clinic_plans")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", sub.id)

    // Attach free plan
    await admin.rpc("attach_free_plan_to_clinic", {
      p_clinic_id: sub.clinic_id,
    })

    await logAuditEvent("payment_failed_blocked", "subscription", sub.id, {
      clinic_id: sub.clinic_id,
    }).catch(console.error)

    blockedCount++
  }

  console.log(
    `[blockSubscriptionsWithFailedPayment] Blocked ${blockedCount} subscriptions`
  )
  return blockedCount
}
