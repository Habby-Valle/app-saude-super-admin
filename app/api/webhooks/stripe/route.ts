import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase-admin"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ""

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature") ?? ""

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const planId = session.metadata?.plan_id
    const clinicId = session.metadata?.clinic_id
    const billingCycle = session.metadata?.billing_cycle ?? "monthly"

    if (!planId || !clinicId) {
      console.error("[webhook] Missing metadata:", { planId, clinicId })
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const admin = createAdminClient()

    const expiresAt = new Date()
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

    // Cancel previous plans
    const { error: updateError } = await admin
      .from("clinic_plans")
      .update({ status: "cancelled" })
      .eq("clinic_id", clinicId)
      .in("status", ["trial", "active"])

    if (updateError) {
      console.error("[webhook] Error canceling previous plan:", updateError)
    }

    // Create new subscription
    const { data: newPlan, error: insertError } = await admin
      .from("clinic_plans")
      .insert({
        clinic_id: clinicId,
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        trial_ends_at: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[webhook] Error creating subscription:", insertError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Save payment record
    const paymentAmount = session.amount_total ? session.amount_total / 100 : 0
    const paymentMethod = session.payment_method_types?.[0] ?? "card"

    await admin.from("subscription_payments").insert({
      clinic_id: clinicId,
      clinic_plan_id: newPlan?.id,
      stripe_payment_id: session.payment_intent as string,
      stripe_subscription_id: session.subscription as string,
      stripe_session_id: session.id,
      amount: paymentAmount,
      currency: session.currency ?? "brl",
      status: "succeeded",
      payment_method: paymentMethod,
      billing_cycle: billingCycle,
      paid_at: new Date().toISOString(),
    })

    // Save Stripe customer ID on clinic
    const customerId = session.customer as string
    if (customerId) {
      await admin
        .from("clinics")
        .update({ stripe_customer_id: customerId })
        .eq("id", clinicId)
    }

    console.log(
      `[webhook] Subscription activated for clinic ${clinicId}, plan ${planId}`
    )
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription
    const admin = createAdminClient()

    let clinicId = subscription.metadata?.clinic_id

    if (!clinicId) {
      const customerId = subscription.customer as string
      if (customerId) {
        const { data: clinic } = await admin
          .from("clinics")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()
        clinicId = clinic?.id
      }
    }

    if (clinicId) {
      const { error: freePlanError } = await admin.rpc(
        "attach_free_plan_to_clinic",
        {
          p_clinic_id: clinicId,
        }
      )

      if (freePlanError) {
        console.error("[webhook] Error attaching free plan:", freePlanError)
      }

      console.log(
        `[webhook] Subscription cancelled for clinic ${clinicId}, migrated to Free`
      )
    } else {
      console.error(
        "[webhook] Could not find clinic for cancelled subscription"
      )
    }
  }

  return NextResponse.json({ received: true })
}
