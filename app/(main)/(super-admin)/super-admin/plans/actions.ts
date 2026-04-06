"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { planSchema, planBenefitSchema } from "@/lib/validations/plan"
import type {
  PlanFormValues,
  PlanBenefitFormValues,
} from "@/lib/validations/plan"
import type { Plan, PlanBenefit, PlanBenefitRelation } from "@/types/database"
import { logAuditEvent } from "@/app/(main)/(super-admin)/super-admin/audit-logs/actions"

export interface PlansResult {
  plans: Plan[]
  total: number
}

export interface PlanWithBenefits extends Plan {
  benefits: PlanBenefit[]
}

export interface PlanDetails {
  plan: Plan
  benefits: PlanBenefit[]
  benefitRelations: PlanBenefitRelation[]
  clinicsCount: number
}

export async function getPlans(params?: {
  search?: string
  isActive?: boolean | null
  page?: number
  pageSize?: number
}): Promise<PlansResult> {
  const { supabase } = await requireSuperAdmin()

  const { search = "", isActive = null, page = 1, pageSize = 10 } = params ?? {}
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("plans")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (isActive !== null) {
    query = query.eq("is_active", isActive)
  }

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getPlans] Supabase error:", error)
    throw new Error(error.message)
  }

  return { plans: data ?? [], total: count ?? 0 }
}

export async function getAllPlans(): Promise<Plan[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[getAllPlans] Supabase error:", error)
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getPlanById(id: string): Promise<PlanDetails | null> {
  const { supabase } = await requireSuperAdmin()

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single()

  if (planError || !plan) {
    console.error("[getPlanById] Plan not found:", planError)
    return null
  }

  const [benefitsResult, relationsResult, clinicsCountResult] =
    await Promise.all([
      supabase
        .from("plan_benefits")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase.from("plan_benefit_relations").select("*").eq("plan_id", id),
      supabase
        .from("clinic_plans")
        .select("id", { count: "exact", head: true })
        .eq("plan_id", id)
        .neq("status", "cancelled"),
    ])

  return {
    plan,
    benefits: benefitsResult.data ?? [],
    benefitRelations: relationsResult.data ?? [],
    clinicsCount: clinicsCountResult.count ?? 0,
  }
}

export async function createPlan(
  raw: PlanFormValues
): Promise<{ success: boolean; error?: string; id?: string }> {
  const result = planSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { supabase } = await requireSuperAdmin()
  const data = result.data

  const { data: created, error } = await supabase
    .from("plans")
    .insert({
      name: data.name,
      description: data.description,
      price: data.price,
      billing_cycle: data.billing_cycle,
      is_active: data.is_active,
      features: data.features,
      max_users: data.max_users,
      max_patients: data.max_patients,
      max_storage: data.max_storage,
      sort_order: data.sort_order,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[createPlan] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("create", "plan", created.id).catch(() => {})
  revalidatePath("/super-admin/plans")
  return { success: true, id: created.id }
}

export async function updatePlan(
  id: string,
  raw: PlanFormValues
): Promise<{ success: boolean; error?: string }> {
  const result = planSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { supabase } = await requireSuperAdmin()
  const data = result.data

  const { error } = await supabase
    .from("plans")
    .update({
      name: data.name,
      description: data.description,
      price: data.price,
      billing_cycle: data.billing_cycle,
      is_active: data.is_active,
      features: data.features,
      max_users: data.max_users,
      max_patients: data.max_patients,
      max_storage: data.max_storage,
      sort_order: data.sort_order,
    })
    .eq("id", id)

  if (error) {
    console.error("[updatePlan] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("update", "plan", id).catch(() => {})
  revalidatePath("/super-admin/plans")
  revalidatePath(`/super-admin/plans/${id}`)
  return { success: true }
}

export async function deletePlan(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { count } = await supabase
    .from("clinic_plans")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", id)
    .neq("status", "cancelled")

  if (count && count > 0) {
    return {
      success: false,
      error: `Não é possível excluir: ${count} clínica(s) está(ão) usando este plano.`,
    }
  }

  await supabase.from("plan_benefit_relations").delete().eq("plan_id", id)

  const { error } = await supabase.from("plans").delete().eq("id", id)

  if (error) {
    console.error("[deletePlan] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("delete", "plan", id).catch(() => {})
  revalidatePath("/super-admin/plans")
  return { success: true }
}

export async function togglePlanActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { error } = await supabase
    .from("plans")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    console.error("[togglePlanActive] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent(isActive ? "activate" : "deactivate", "plan", id).catch(
    () => {}
  )
  revalidatePath("/super-admin/plans")
  return { success: true }
}

export async function getPlanBenefits(): Promise<PlanBenefit[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("plan_benefits")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name")

  if (error) {
    console.error("[getPlanBenefits] Supabase error:", error)
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createPlanBenefit(
  raw: PlanBenefitFormValues
): Promise<{ success: boolean; error?: string }> {
  const result = planBenefitSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { supabase } = await requireSuperAdmin()
  const data = result.data

  const { data: existing } = await supabase
    .from("plan_benefits")
    .select("id")
    .eq("code", data.code)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Já existe um benefício com este código" }
  }

  const { error } = await supabase.from("plan_benefits").insert({
    name: data.name,
    code: data.code,
    category: data.category,
    icon: data.icon,
    is_active: data.is_active,
  })

  if (error) {
    console.error("[createPlanBenefit] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("create", "plan_benefit", "").catch(() => {})
  revalidatePath("/super-admin/plans")
  return { success: true }
}

export async function setPlanBenefits(
  planId: string,
  benefitIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  await supabase.from("plan_benefit_relations").delete().eq("plan_id", planId)

  if (benefitIds.length > 0) {
    const relations = benefitIds.map((benefitId) => ({
      plan_id: planId,
      benefit_id: benefitId,
      is_enabled: true,
    }))

    const { error } = await supabase
      .from("plan_benefit_relations")
      .insert(relations)

    if (error) {
      console.error("[setPlanBenefits] Supabase error:", error)
      return { success: false, error: error.message }
    }
  }

  await logAuditEvent("update", "plan", planId).catch(() => {})
  revalidatePath(`/super-admin/plans/${planId}`)
  return { success: true }
}
