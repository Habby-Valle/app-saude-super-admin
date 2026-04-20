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

    // Marcar trial como usado permanentemente após qualquer assinatura paga
    const { error: trialError } = await admin
      .from("clinics")
      .update({ has_used_trial: true })
      .eq("id", clinicId)

    if (trialError) {
      console.error("[webhook] Error updating has_used_trial:", trialError)
    } else {
      console.log("[webhook] has_used_trial设置为true para clínica:", clinicId)
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
      // Marcar planos anteriores como cancelled ANTES de attach_free_plan
      await admin
        .from("clinic_plans")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("clinic_id", clinicId)
        .in("status", ["active", "trial"])

      const { error: freePlanError } = await admin.rpc(
        "attach_free_plan_to_clinic",
        { p_clinic_id: clinicId }
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

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription
    const admin = createAdminClient()

    const status = subscription.status
    console.log("[webhook] subscription.updated received, status:", status)

    if (status !== "canceled" && status !== "past_due") {
      console.log("[webhook] Status not canceled/past_due, skipping")
      return NextResponse.json({ received: true })
    }

    let clinicId = subscription.metadata?.clinic_id
    console.log("[webhook] clinicId from metadata:", clinicId)

    if (!clinicId) {
      const customerId = subscription.customer as string
      console.log(
        "[webhook] Looking for clinic with stripe_customer_id:",
        customerId
      )
      if (customerId) {
        const { data: clinic, error: clinicError } = await admin
          .from("clinics")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()
        if (clinicError) {
          console.error("[webhook] Error finding clinic:", clinicError)
        }
        clinicId = clinic?.id
        console.log("[webhook] Found clinicId:", clinicId)
      }
    }

    if (!clinicId) {
      console.error(
        "[webhook] Clinic not found for subscription, will try customer lookup"
      )
    }

    if (clinicId) {
      // Marcar planos anteriores como cancelled
      console.log("[webhook] Cancelling previous plans for clinic:", clinicId)
      const { error: cancelError } = await admin
        .from("clinic_plans")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("clinic_id", clinicId)
        .in("status", ["active", "trial"])

      if (cancelError) {
        console.error("[webhook] Error cancelling plans:", cancelError)
      }

      console.log("[webhook] Attaching free plan to clinic:", clinicId)
      const { error: freePlanError } = await admin.rpc(
        "attach_free_plan_to_clinic",
        { p_clinic_id: clinicId }
      )

      if (freePlanError) {
        console.error(
          "[webhook] Error attaching free plan on updated:",
          freePlanError
        )
      }

      console.log(
        `[webhook] Subscription ${status} for clinic ${clinicId}, migrated to Free`
      )
    }
  }

  // Handle renewal payments - Invoice paid successfully
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as unknown as {
      subscription: string | null
      customer: string | null
      id: string
      amount_paid: number
      currency: string
      payment_intent: string | null
      payment_method_types: string[]
    }
    const admin = createAdminClient()

    const subscriptionId = invoice.subscription
    if (!subscriptionId) {
      console.log(
        "[webhook] invoice.payment_succeeded: no subscription, skipping"
      )
      return NextResponse.json({ received: true })
    }

    // Find clinic by stripe_subscription_id or customer
    let clinicId: string | null = null
    let billingCycle = "monthly"

    // First try to find by subscription metadata
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
      clinicId = stripeSub.metadata?.clinic_id ?? null
      if (stripeSub.items.data[0]?.price.recurring?.interval) {
        const interval = stripeSub.items.data[0].price.recurring.interval
        const intervalCount =
          stripeSub.items.data[0].price.recurring.interval_count ?? 1
        if (interval === "month" && intervalCount === 3) {
          billingCycle = "quarterly"
        } else if (interval === "year") {
          billingCycle = "annual"
        } else {
          billingCycle = "monthly"
        }
      }
    } catch (err) {
      console.error("[webhook] Error fetching subscription:", err)
    }

    if (!clinicId) {
      const customerId = invoice.customer as string
      if (customerId) {
        const { data: clinic } = await admin
          .from("clinics")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()
        clinicId = clinic?.id ?? null
      }
    }

    if (!clinicId) {
      console.log("[webhook] invoice.payment_succeeded: clinic not found")
      return NextResponse.json({ received: true })
    }

    // Find active subscription for this clinic
    const { data: clinicPlan } = await admin
      .from("clinic_plans")
      .select("id, expires_at")
      .eq("clinic_id", clinicId)
      .eq("status", "active")
      .single()

    if (!clinicPlan) {
      console.log("[webhook] No active clinic_plan found for clinic:", clinicId)
      return NextResponse.json({ received: true })
    }

    // Calculate new expiration date
    const currentExpires = new Date(clinicPlan.expires_at)
    let newExpires: Date

    switch (billingCycle) {
      case "monthly":
        newExpires = new Date(currentExpires)
        newExpires.setMonth(newExpires.getMonth() + 1)
        break
      case "quarterly":
        newExpires = new Date(currentExpires)
        newExpires.setMonth(newExpires.getMonth() + 3)
        break
      case "annual":
        newExpires = new Date(currentExpires)
        newExpires.setFullYear(newExpires.getFullYear() + 1)
        break
      default:
        newExpires = new Date(currentExpires)
        newExpires.setMonth(newExpires.getMonth() + 1)
    }

    // Update expiration date
    const { error: updateError } = await admin
      .from("clinic_plans")
      .update({
        expires_at: newExpires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clinicPlan.id)

    if (updateError) {
      console.error("[webhook] Error updating expires_at:", updateError)
    }

    // Record payment
    const paymentAmount = invoice.amount_paid / 100
    await admin.from("subscription_payments").insert({
      clinic_id: clinicId!,
      clinic_plan_id: clinicPlan.id,
      stripe_payment_id: invoice.payment_intent ?? "",
      stripe_subscription_id: subscriptionId,
      stripe_session_id: invoice.id,
      amount: paymentAmount,
      currency: invoice.currency ?? "brl",
      status: "succeeded",
      payment_method: invoice.payment_method_types?.[0] ?? "card",
      billing_cycle: billingCycle,
      paid_at: new Date().toISOString(),
    })

    console.log(
      `[webhook] Renewal payment successful for clinic ${clinicId}, new expires: ${newExpires.toISOString()}`
    )
  }

  // Handle failed payments
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as unknown as {
      customer: string | null
      subscription: string | null
      amount_due: number
      currency: string
      payment_intent: string | null
      payment_method_types: string[]
    }
    const admin = createAdminClient()

    const customerId = invoice.customer
    if (!customerId) {
      return NextResponse.json({ received: true })
    }

    const { data: clinic } = await admin
      .from("clinics")
      .select("id, name")
      .eq("stripe_customer_id", customerId)
      .single()

    if (!clinic) {
      console.log("[webhook] invoice.payment_failed: clinic not found")
      return NextResponse.json({ received: true })
    }

    // Record failed payment attempt
    const paymentAmount = invoice.amount_due / 100
    await admin.from("subscription_payments").insert({
      clinic_id: clinic.id,
      clinic_plan_id: null,
      stripe_payment_id: invoice.payment_intent ?? "",
      stripe_subscription_id: invoice.subscription ?? "",
      stripe_session_id: "",
      amount: paymentAmount,
      currency: invoice.currency ?? "brl",
      status: "failed",
      payment_method: invoice.payment_method_types?.[0] ?? "card",
      billing_cycle: "monthly",
      paid_at: new Date().toISOString(),
    })

    // Mark subscription as payment failed for grace period tracking
    const { data: activePlan } = await admin
      .from("clinic_plans")
      .select("id")
      .eq("clinic_id", clinic.id)
      .eq("status", "active")
      .single()

    if (activePlan) {
      await admin
        .from("clinic_plans")
        .update({
          payment_failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", activePlan.id)
    }

    console.log(
      `[webhook] Payment failed for clinic ${clinic.id} (${clinic.name}), amount: R$${paymentAmount}`
    )
  }

  return NextResponse.json({ received: true })
}
