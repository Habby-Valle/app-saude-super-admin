import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { ExitClinicBanner } from "./exit-clinic-banner"

export async function SuperAdminBanner() {
  const cookieStore = await cookies()
  const clinicId = cookieStore.get("sa-clinic-id")?.value
  if (!clinicId) return null

  // Get current user role — if not super_admin, don't show
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "super_admin") return null

  // Get clinic name
  const { data: clinic } = await supabase
    .from("clinics")
    .select("name")
    .eq("id", clinicId)
    .single()

  return <ExitClinicBanner clinicName={clinic?.name ?? "Clínica"} />
}
