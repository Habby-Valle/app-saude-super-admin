import { redirect } from "next/navigation"
import { getMyClinicPlan } from "../actions"
import { ManageSubscriptionClient } from "./manage-client"

export const metadata = {
  title: "Gerenciar Assinatura",
}

async function getClinicData() {
  const { supabase, clinicId } = await import("@/lib/auth").then((m) =>
    m.requireClinicAdmin()
  )

  if (!clinicId) {
    return null
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("id, name, stripe_customer_id")
    .eq("id", clinicId)
    .single()

  return clinic
}

export default async function ManageSubscriptionPage() {
  const [clinicPlan, clinic] = await Promise.all([
    getMyClinicPlan(),
    getClinicData(),
  ])

  if (!clinic) {
    redirect("/admin/plan")
  }

  return (
    <ManageSubscriptionClient
      clinicName={clinic.name}
      hasStripeCustomer={!!clinic.stripe_customer_id}
      currentStatus={clinicPlan?.clinicPlan?.status ?? null}
    />
  )
}
