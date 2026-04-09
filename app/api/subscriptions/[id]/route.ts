import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

interface SubscriptionData {
  id: string
  clinic_id: string
  plan_id: string
  status: string
  started_at: string
  expires_at: string
  trial_ends_at: string | null
  created_at: string
  clinics: { id: string; name: string; email: string } | null
  plans: {
    id: string
    name: string
    description: string
    price: number
    billing_cycle: string
    max_users: number
    max_patients: number
    features: string[]
  } | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()

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
        created_at,
        clinics (
          id,
          name,
          email
        ),
        plans (
          id,
          name,
          description,
          price,
          billing_cycle,
          max_users,
          max_patients,
          features
        )
      `
      )
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Assinatura não encontrada" },
        { status: 404 }
      )
    }

    const subs = data as unknown as SubscriptionData

    return NextResponse.json({
      id: subs.id,
      clinicId: subs.clinic_id,
      clinicName: subs.clinics?.name ?? "Clínica sem nome",
      clinicEmail: subs.clinics?.email ?? "",
      planId: subs.plan_id,
      planName: subs.plans?.name ?? "Plano não encontrado",
      planDescription: subs.plans?.description ?? "",
      planPrice: subs.plans?.price ?? 0,
      planBillingCycle: subs.plans?.billing_cycle ?? "monthly",
      status: subs.status,
      startedAt: subs.started_at,
      expiresAt: subs.expires_at,
      trialEndsAt: subs.trial_ends_at,
      createdAt: subs.created_at,
      maxUsers: subs.plans?.max_users ?? 0,
      maxPatients: subs.plans?.max_patients ?? 0,
      features: subs.plans?.features ?? [],
    })
  } catch (error) {
    console.error("[subscription-detail] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
