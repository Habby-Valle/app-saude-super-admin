import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireClinicAdmin } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { clinicId, returnUrl } = await request.json()

    const { supabase, clinicId: authClinicId } = await requireClinicAdmin()

    const targetClinicId = clinicId ?? authClinicId

    if (!targetClinicId) {
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: clinic, error: clinicError } = await admin
      .from("clinics")
      .select("id, name, stripe_customer_id")
      .eq("id", targetClinicId)
      .single()

    if (clinicError || !clinic) {
      console.error("[portal] Clinic not found:", clinicError)
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 404 }
      )
    }

    if (!clinic.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "Cliente Stripe não encontrado. Efetue um pagamento primeiro.",
        },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const finalReturnUrl = returnUrl ?? `${appUrl}/admin/plan`

    const session = await stripe.billingPortal.sessions.create({
      customer: clinic.stripe_customer_id,
      return_url: finalReturnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[portal] Error:", error)
    return NextResponse.json(
      { error: "Erro ao criar sessão do portal" },
      { status: 500 }
    )
  }
}
