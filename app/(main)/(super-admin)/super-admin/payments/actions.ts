"use server"

import { requireSuperAdmin } from "@/lib/auth"

export interface PaymentWithClinic {
  id: string
  clinicId: string
  clinicName: string
  planName: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  billingCycle: string
  paidAt: string | null
  stripePaymentId: string | null
  createdAt: string
}

interface PaymentRow {
  id: string
  clinic_id: string
  amount: number
  currency: string
  status: string
  payment_method: string | null
  billing_cycle: string | null
  paid_at: string | null
  stripe_payment_id: string | null
  created_at: string
  clinic_plan_id: string | null
  clinic_plans: { plan_id: string; plans: { name: string }[] }[] | null
  clinics: { id: string; name: string }[] | null
}

export async function getAllPayments(): Promise<PaymentWithClinic[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("subscription_payments")
    .select(
      `
      id,
      clinic_id,
      amount,
      currency,
      status,
      payment_method,
      billing_cycle,
      paid_at,
      stripe_payment_id,
      created_at,
      clinic_plan_id,
      clinic_plans (
        plan_id,
        plans (
          name
        )
      ),
      clinics (
        id,
        name
      )
    `
    )
    .order("paid_at", { ascending: false })

  if (error) {
    console.error("[getAllPayments] Error:", error)
    return []
  }

  const payments: PaymentWithClinic[] = (data ?? []).map((row) => {
    const r = row as unknown as PaymentRow
    const clinic = Array.isArray(r.clinics) ? r.clinics[0] : null
    const clinicPlan = Array.isArray(r.clinic_plans) ? r.clinic_plans[0] : null
    const plan = clinicPlan?.plans ? clinicPlan.plans[0] : null

    return {
      id: r.id,
      clinicId: r.clinic_id,
      clinicName: clinic?.name ?? "Clínica não encontrada",
      planName: plan?.name ?? "Plano não encontrado",
      amount: r.amount ?? 0,
      currency: r.currency ?? "brl",
      status: r.status,
      paymentMethod: r.payment_method ?? "unknown",
      billingCycle: r.billing_cycle ?? "monthly",
      paidAt: r.paid_at,
      stripePaymentId: r.stripe_payment_id,
      createdAt: r.created_at,
    }
  })

  return payments
}

export async function getPaymentStats() {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("subscription_payments")
    .select("status, amount")

  if (error) {
    console.error("[getPaymentStats] Error:", error)
    return { total: 0, succeeded: 0, failed: 0, totalRevenue: 0 }
  }

  const stats = {
    total: data?.length ?? 0,
    succeeded: data?.filter((r) => r.status === "succeeded").length ?? 0,
    failed: data?.filter((r) => r.status === "failed").length ?? 0,
    totalRevenue:
      data
        ?.filter((r) => r.status === "succeeded")
        .reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0,
  }

  return stats
}
