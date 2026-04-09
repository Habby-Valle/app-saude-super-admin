import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()

    const body = await request.json()
    const { subscriptionId, planId, billingCycle } = body

    if (!subscriptionId || !planId) {
      return NextResponse.json(
        { error: "subscriptionId e planId são obrigatórios" },
        { status: 400 }
      )
    }

    const { createAdminClient } = await import("@/lib/supabase-admin")
    const admin = createAdminClient()

    const startDate = new Date()
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

    const { error } = await admin
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

    if (error) {
      console.error("[activate-subscription] Error:", error)
      return NextResponse.json(
        { error: "Erro ao ativar assinatura" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[activate-subscription] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
