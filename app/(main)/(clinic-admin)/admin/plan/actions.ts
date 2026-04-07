"use server"

import { revalidatePath } from "next/cache"
import { requireClinicAdmin } from "@/lib/auth"
import type { Plan, ClinicPlan, PlanStatus } from "@/types/database"

export interface ClinicPlanInfo {
  clinicPlan: ClinicPlan | null
  plan: Plan | null
}

export interface PlanWithDetails extends Plan {
  clinicPlan?: ClinicPlan | null
}

export async function getMyClinicPlan(): Promise<ClinicPlanInfo | null> {
  const { supabase, clinicId } = await requireClinicAdmin()

  if (!clinicId) return null

  const { data: clinicPlan, error: clinicPlanError } = await supabase
    .from("clinic_plans")
    .select("*")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (clinicPlanError) {
    console.error("[getMyClinicPlan] Error:", clinicPlanError)
    return null
  }

  if (!clinicPlan) {
    return { clinicPlan: null, plan: null }
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", clinicPlan.plan_id)
    .single()

  if (planError) {
    console.error("[getMyClinicPlan] Plan error:", planError)
    return null
  }

  return { clinicPlan, plan }
}

export async function getAvailablePlans(): Promise<Plan[]> {
  const { supabase } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[getAvailablePlans] Error:", error)
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getAllPlans(): Promise<Plan[]> {
  const { supabase } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[getAllPlans] Error:", error)
    throw new Error(error.message)
  }

  return data ?? []
}

export async function requestPlanChange(
  planId: string,
  billingCycle: "monthly" | "quarterly" | "annual" = "monthly"
): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
  const { supabase, clinicId } = await requireClinicAdmin()

  if (!clinicId) {
    return { success: false, error: "Clínica não encontrada" }
  }

  const { data: targetPlan } = await supabase
    .from("plans")
    .select("id, name, price")
    .eq("id", planId)
    .single()

  if (!targetPlan) {
    return { success: false, error: "Plano não encontrado" }
  }

  if (targetPlan.price === 0) {
    const now = new Date()
    const expiresAt = new Date(now)

    switch (billingCycle) {
      case "monthly":
        expiresAt.setMonth(expiresAt.getMonth() + 1)
        break
      case "quarterly":
        expiresAt.setMonth(expiresAt.getMonth() + 3)
        break
      case "annual":
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        break
    }

    const { error: updateError } = await supabase
      .from("clinic_plans")
      .update({ status: "cancelled" })
      .eq("clinic_id", clinicId)
      .in("status", ["active", "trial"])

    if (updateError) {
      return { success: false, error: "Erro ao atualizar plano anterior" }
    }

    const { error: insertError } = await supabase.from("clinic_plans").insert({
      clinic_id: clinicId,
      plan_id: planId,
      status: "active" as PlanStatus,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      trial_ends_at: null,
    })

    if (insertError) {
      return { success: false, error: "Erro ao criar novo plano" }
    }

    await supabase
      .from("clinics")
      .update({ plan: targetPlan.name })
      .eq("id", clinicId)

    revalidatePath("/admin/plan")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/settings")

    return { success: true }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const successUrl = `${appUrl}/admin/plan?success=true`
  const cancelUrl = `${appUrl}/admin/plan?canceled=true`

  const { data: user } = await supabase.auth.getUser()
  const customerEmail = user.user?.email

  const stripeResponse = await fetch(`${appUrl}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId,
      clinicId,
      billingCycle,
    }),
  })

  const stripeData = await stripeResponse.json()

  if (!stripeResponse.ok || !stripeData.url) {
    console.error("[requestPlanChange] Stripe error:", stripeData.error)
    return {
      success: false,
      error: stripeData.error ?? "Erro ao criar checkout",
    }
  }

  return { success: true, checkoutUrl: stripeData.url }
}

export async function getClinicPlanHistory(): Promise<ClinicPlan[]> {
  const { supabase, clinicId } = await requireClinicAdmin()

  if (!clinicId) return []

  const { data, error } = await supabase
    .from("clinic_plans")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getClinicPlanHistory] Error:", error)
    return []
  }

  return data ?? []
}
