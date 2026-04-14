import { createAdminClient } from "@/lib/supabase-admin"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("clinic_plans")
    .select(
      `
      id,
      status,
      expires_at,
      trial_ends_at,
      plans (
        price,
        billing_cycle
      )
    `
    )
    .in("status", ["active", "trial"])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count: data?.length ?? 0 })
}
