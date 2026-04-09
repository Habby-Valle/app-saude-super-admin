import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

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

    return NextResponse.json({
      id: data.id,
      clinicId: data.clinic_id,
      clinicName: data.clinics?.name ?? "Clínica sem nome",
      clinicEmail: data.clinics?.email ?? "",
      planId: data.plan_id,
      planName: data.plans?.name ?? "Plano não encontrado",
      planDescription: data.plans?.description ?? "",
      planPrice: data.plans?.price ?? 0,
      planBillingCycle: data.plans?.billing_cycle ?? "monthly",
      status: data.status,
      startedAt: data.started_at,
      expiresAt: data.expires_at,
      trialEndsAt: data.trial_ends_at,
      createdAt: data.created_at,
      maxUsers: data.plans?.max_users ?? 0,
      maxPatients: data.plans?.max_patients ?? 0,
      features: data.plans?.features ?? [],
    })
  } catch (error) {
    console.error("[subscription-detail] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
