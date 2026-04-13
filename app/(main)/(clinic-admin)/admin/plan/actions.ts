"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireClinicAdmin } from "@/lib/auth"
import type { Plan, ClinicPlan, PlanStatus } from "@/types/database"

export interface ClinicPlanInfo {
  clinicPlan: ClinicPlan | null
  plan: Plan | null
  hasUsedTrial?: boolean
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
    .in("status", ["active", "trial", "free"])
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

  const { data: clinic } = await supabase
    .from("clinics")
    .select("has_used_trial")
    .eq("id", clinicId)
    .single()

  return { clinicPlan, plan, hasUsedTrial: clinic?.has_used_trial ?? false }
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
  const admin = createAdminClient()

  console.log("[requestPlanChange] clinicId:", clinicId)

  if (!clinicId) {
    return {
      success: false,
      error:
        "Clínica não encontrada. Seu usuário pode não estar vinculado a uma clínica.",
    }
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
    if (targetPlan.name === "Trial") {
      const { data: clinic } = await supabase
        .from("clinics")
        .select("has_used_trial")
        .eq("id", clinicId)
        .single()

      if (clinic?.has_used_trial) {
        return {
          success: false,
          error: "Você já utilizou o Trial anteriormente",
        }
      }
    }

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

    const { error: updateError } = await admin
      .from("clinic_plans")
      .update({ status: "cancelled" })
      .eq("clinic_id", clinicId)
      .in("status", ["active", "trial", "free"])

    if (updateError) {
      return { success: false, error: "Erro ao atualizar plano anterior" }
    }

    if (targetPlan.name === "Trial") {
      await admin
        .from("clinics")
        .update({ has_used_trial: true })
        .eq("id", clinicId)
    }

    const { error: insertError } = await admin.from("clinic_plans").insert({
      clinic_id: clinicId,
      plan_id: planId,
      status:
        targetPlan.name === "Trial"
          ? "trial"
          : targetPlan.name === "Free"
            ? "free"
            : "active",
      started_at: now.toISOString(),
      expires_at:
        targetPlan.name === "Trial"
          ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : expiresAt.toISOString(),
      trial_ends_at:
        targetPlan.name === "Trial"
          ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null,
    })

    if (insertError) {
      console.error("[requestPlanChange] Insert error:", insertError)
      return { success: false, error: "Erro ao criar novo plano" }
    }

    await admin
      .from("clinics")
      .update({ plan: targetPlan.name })
      .eq("id", clinicId)

    revalidatePath("/admin/plan")
    revalidatePath("/admin/dashboard")
    revalidatePath("/admin/settings")

    return { success: true }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://app-saude-seven.vercel.app"

  const changePlanResponse = await fetch(
    `${baseUrl}/api/subscriptions/change-plan`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicId,
        newPlanId: planId,
        billingCycle,
      }),
    }
  )

  const changePlanData = await changePlanResponse.json()

  if (changePlanResponse.ok && changePlanData.success) {
    if (changePlanData.checkoutUrl) {
      return { success: true, checkoutUrl: changePlanData.checkoutUrl }
    }

    await admin
      .from("clinics")
      .update({ plan: targetPlan.name })
      .eq("id", clinicId)

    revalidatePath("/admin/plan")
    revalidatePath("/admin/dashboard")

    return { success: true }
  }

  if (changePlanData.needsCheckout) {
    const stripeResponse = await fetch(`${baseUrl}/api/checkout`, {
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
      return {
        success: false,
        error: stripeData.error ?? "Erro ao criar checkout",
      }
    }

    return { success: true, checkoutUrl: stripeData.url }
  }

  console.error("[requestPlanChange] Error:", changePlanData.error)

  return {
    success: false,
    error: changePlanData.error ?? "Erro ao mudar de plano",
  }
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

export async function manageGetClinic(): Promise<{
  id: string
  name: string
  stripe_customer_id: string | null
} | null> {
  const { supabase, clinicId, isSuperAdmin } = await requireClinicAdmin()

  console.log("[manageGetClinic] clinicId:", clinicId)
  console.log("[manageGetClinic] isSuperAdmin:", isSuperAdmin)

  if (!clinicId) return null

  // Super admin impersonating needs admin client to bypass RLS
  const client = isSuperAdmin ? createAdminClient() : supabase

  const { data: clinic, error } = await client
    .from("clinics")
    .select("id, name, stripe_customer_id")
    .eq("id", clinicId)
    .single()

  console.log("[manageGetClinic] clinic query result:", { clinic, error })

  if (error) {
    console.error("[manageGetClinic] Error:", error)
    console.error("[manageGetClinic] clinicId used:", clinicId)
    return null
  }

  return clinic
}
