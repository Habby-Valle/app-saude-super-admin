"use server"

import { requireSuperAdmin } from "@/lib/auth"
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

  return { success: true }
}
