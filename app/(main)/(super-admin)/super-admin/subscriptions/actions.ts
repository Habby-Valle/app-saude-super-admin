"use server"

import { requireSuperAdmin } from "@/lib/auth"
import type { Plan, ClinicPlan } from "@/types/database"

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

  const subscriptions: SubscriptionWithClinic[] = (data ?? []).map(
    (row: any) => {
      const expiresAt = new Date(row.expires_at)
      const daysRemaining = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        id: row.id,
        clinicId: row.clinic_id,
        clinicName: row.clinics?.name ?? "Clínica sem nome",
        clinicEmail: row.clinics?.email ?? "",
        planId: row.plan_id,
        planName: row.plans?.name ?? "Plano não encontrado",
        planPrice: row.plans?.price ?? 0,
        planBillingCycle: row.plans?.billing_cycle ?? "monthly",
        status: row.status,
        startedAt: row.started_at,
        expiresAt: row.expires_at,
        trialEndsAt: row.trial_ends_at,
        daysRemaining:
          row.status === "active" || row.status === "trial"
            ? daysRemaining
            : null,
      }
    }
  )

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
