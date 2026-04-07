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

    const { error: updateError } = await admin
      .from("clinic_plans")
      .update({ status: "cancelled" })
      .eq("clinic_id", clinicId)
      .in("status", ["trial", "active"])

    if (updateError) {
      console.error("[webhook] Error canceling previous plan:", updateError)
    }

    const { error: insertError } = await admin.from("clinic_plans").insert({
      clinic_id: clinicId,
      plan_id: planId,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      trial_ends_at: null,
    })

    if (insertError) {
      console.error("[webhook] Error creating subscription:", insertError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    console.log(
      `[webhook] Subscription activated for clinic ${clinicId}, plan ${planId}`
    )
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription

    const clinicId = subscription.metadata?.clinic_id

    if (clinicId) {
      const admin = createAdminClient()
      await admin
        .from("clinic_plans")
        .update({ status: "cancelled" })
        .eq("clinic_id", clinicId)
        .eq("status", "active")

      console.log(`[webhook] Subscription cancelled for clinic ${clinicId}`)
    }
  }

  return NextResponse.json({ received: true })
}
