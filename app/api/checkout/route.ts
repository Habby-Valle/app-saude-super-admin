import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
})

interface CheckoutRequest {
  planId: string
  clinicId: string
  billingCycle?: "monthly" | "quarterly" | "annual"
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    const { planId, clinicId, billingCycle = "monthly" } = body

    if (!planId || !clinicId) {
      return NextResponse.json(
        { error: "planId e clinicId são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, description, price, billing_cycle, features")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      )
    }

    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 404 }
      )
    }

    const { data: user } = await supabase.auth.getUser()
    const customerEmail = user.user?.email

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const successUrl = `${appUrl}/admin/plan?success=true&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${appUrl}/admin/plan?canceled=true`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: customerEmail ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: plan.name,
              description:
                plan.description ??
                `Plano ${plan.name} - cobrança ${billingCycle}`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval:
                billingCycle === "monthly"
                  ? "month"
                  : billingCycle === "quarterly"
                    ? "month"
                    : "year",
              interval_count: billingCycle === "quarterly" ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan_id: plan.id,
        clinic_id: clinic.id,
        billing_cycle: billingCycle,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Erro ao criar sessão de checkout" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error("[checkout] Error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
