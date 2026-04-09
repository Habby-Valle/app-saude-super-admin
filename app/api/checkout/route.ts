import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClientForRoute } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("[checkout] STRIPE_SECRET_KEY não configurada!")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
})

interface CheckoutRequest {
  planId: string
  clinicId: string
  billingCycle?: "monthly" | "quarterly" | "annual"
  isProrate?: boolean
}

function calculateProrate(
  currentPlanPrice: number,
  newPlanPrice: number,
  startedAt: string,
  billingCycle: string
): number {
  const now = new Date()
  const startDate = new Date(startedAt)

  let totalDays: number
  switch (billingCycle) {
    case "monthly":
      totalDays = 30
      break
    case "quarterly":
      totalDays = 90
      break
    case "annual":
      totalDays = 365
      break
    default:
      totalDays = 30
  }

  const daysUsed = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const daysRemaining = Math.max(0, totalDays - daysUsed)

  if (daysRemaining <= 0 || newPlanPrice <= currentPlanPrice) {
    return newPlanPrice
  }

  const dailyRateNew = newPlanPrice / totalDays
  const prorateAmount = dailyRateNew * daysRemaining

  return Math.max(0, newPlanPrice - prorateAmount)
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    const {
      planId,
      clinicId,
      billingCycle = "monthly",
      isProrate = false,
    } = body

    if (!planId || !clinicId) {
      return NextResponse.json(
        { error: "planId e clinicId são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClientForRoute(request)
    const admin = createAdminClient()

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

    const { data: clinic, error: clinicError } = await admin
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .single()

    if (clinicError || !clinic) {
      console.error("[checkout] Clinic not found:", clinicError)
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 404 }
      )
    }

    const { data: user } = await supabase.auth.getUser()
    const customerEmail = user.user?.email

    let finalPrice = plan.price
    let description =
      plan.description ?? `Plano ${plan.name} - cobrança ${billingCycle}`

    if (isProrate) {
      const { data: currentPlan } = await supabase
        .from("clinic_plans")
        .select("started_at, plans!inner(price, billing_cycle)")
        .eq("clinic_id", clinicId)
        .in("status", ["active", "trial"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (currentPlan && currentPlan.plans) {
        const currentPlanData = currentPlan.plans as unknown as {
          price: number
          billing_cycle: string
        }
        const prorateAmount = calculateProrate(
          currentPlanData.price,
          plan.price,
          currentPlan.started_at,
          billingCycle
        )
        finalPrice = prorateAmount
        description = `Troca de plano (pró-rata) - ${plan.name}`
      }
    }

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
              description,
            },
            unit_amount: Math.round(finalPrice * 100),
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
