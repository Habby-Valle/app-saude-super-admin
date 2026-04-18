import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase-admin"

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("[change-plan] STRIPE_SECRET_KEY não configurada!")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
})

interface ChangePlanRequest {
  clinicId: string
  newPlanId: string
  billingCycle?: "monthly" | "quarterly" | "annual"
}

export async function POST(request: NextRequest) {
  try {
    const body: ChangePlanRequest = await request.json()
    const { clinicId, newPlanId, billingCycle = "monthly" } = body

    console.log("[change-plan] Received request:", {
      clinicId,
      newPlanId,
      billingCycle,
    })

    if (!clinicId || !newPlanId) {
      return NextResponse.json(
        { error: "clinicId e newPlanId são obrigatórios" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: newPlan, error: planError } = await admin
      .from("plans")
      .select("id, name, price, billing_cycle, stripe_price_id")
      .eq("id", newPlanId)
      .single()

    if (planError || !newPlan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      )
    }

    if (newPlan.price === 0) {
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

      await admin
        .from("clinic_plans")
        .update({
          plan_id: newPlanId,
          status: "free",
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          billing_cycle: billingCycle,
          updated_at: now.toISOString(),
        })
        .eq("clinic_id", clinicId)
        .in("status", ["active", "trial"])

      await admin
        .from("clinics")
        .update({ plan: newPlan.name })
        .eq("id", clinicId)

      return NextResponse.json({ success: true })
    }

    const { data: clinic, error: clinicError } = await admin
      .from("clinics")
      .select("id, name, stripe_customer_id")
      .eq("id", clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 404 }
      )
    }

    if (!clinic.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "Clínica não possui cliente Stripe. A clínica precisa primeiro criar uma assinatura paga.",
          needsCheckout: true,
        },
        { status: 400 }
      )
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: clinic.stripe_customer_id,
      status: "active",
      limit: 1,
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://app-saude-seven.vercel.app"

    if (subscriptions.data.length === 0) {
      const checkoutResponse = await fetch(`${baseUrl}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: newPlanId,
          clinicId,
          billingCycle,
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok || !checkoutData.url) {
        return NextResponse.json(
          { error: checkoutData.error ?? "Erro ao criar checkout" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutData.url,
      })
    }

    const currentSubscription = subscriptions.data[0]
    const subscriptionItemId = currentSubscription.items.data[0].id

    if (!newPlan.stripe_price_id) {
      const newStripePrice = await stripe.prices.create({
        currency: "brl",
        unit_amount: Math.round(newPlan.price * 100),
        recurring: {
          interval: billingCycle === "annual" ? "year" : "month",
          interval_count: billingCycle === "quarterly" ? 3 : 1,
        },
        product_data: {
          name: newPlan.name,
        },
      })

      newPlan.stripe_price_id = newStripePrice.id
      await admin
        .from("plans")
        .update({ stripe_price_id: newStripePrice.id })
        .eq("id", newPlanId)
    }

    await stripe.subscriptions.update(currentSubscription.id, {
      items: [
        {
          id: subscriptionItemId,
          price: newPlan.stripe_price_id,
        },
      ],
      proration_behavior: "always_invoice",
    })

    const { count: clinicPlansCount, error: clinicPlansError } = await admin
      .from("clinic_plans")
      .update({
        plan_id: newPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq("clinic_id", clinicId)
      .in("status", ["active", "trial", "free"])

    if (clinicPlansError) {
      console.error(
        "[change-plan] Erro ao atualizar clinic_plans:",
        clinicPlansError
      )
      return NextResponse.json(
        { error: "Erro ao atualizar plano no banco de dados" },
        { status: 500 }
      )
    }

    if (clinicPlansCount === 0) {
      console.error(
        "[change-plan] Nenhuma linha atualizada em clinic_plans para clinicId:",
        clinicId
      )
      return NextResponse.json(
        { error: "Plano da clínica não encontrado para atualização" },
        { status: 404 }
      )
    }

    await admin
      .from("clinics")
      .update({ plan: newPlan.name })
      .eq("id", clinicId)

    // Marcar trial como usado permanentemente após qualquer assinatura paga
    console.log(
      "[change-plan] newPlan.price:",
      newPlan.price,
      "clinicId:",
      clinicId
    )
    if (newPlan.price > 0) {
      console.log("[change-plan] Updating has_used_trial to true...")
      const { error: trialError } = await admin
        .from("clinics")
        .update({ has_used_trial: true })
        .eq("id", clinicId)

      if (trialError) {
        console.error(
          "[change-plan] Error updating has_used_trial:",
          trialError
        )
      } else {
        console.log("[change-plan] has_used_trial updated successfully!")
      }
    } else {
      console.log("[change-plan] Plan is free, not updating has_used_trial")
    }

    return NextResponse.json({
      success: true,
      proration: true,
      hasUsedTrial: newPlan.price > 0,
      message:
        newPlan.price > 0
          ? "Plano atualizado com pró-rata. Trial bloqueado permanentemente."
          : "Plano atualizado com pró-rata",
    })
  } catch (error) {
    console.error("[change-plan] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
