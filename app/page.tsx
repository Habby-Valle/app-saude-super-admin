import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"
import type { UserRole } from "@/types/database"
import { isMaintenanceMode } from "@/lib/system-settings"

export default async function RootPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  const role = profile?.role as UserRole | undefined
  const isSuperAdmin = role === "super_admin"

  if (!isSuperAdmin) {
    const maintenance = await isMaintenanceMode()
    if (maintenance) {
      redirect("/maintenance")
    }
  }

  switch (role) {
    case "super_admin":
      redirect("/super-admin/dashboard")
    case "clinic_admin":
      redirect("/admin/dashboard")
    default:
      redirect("/welcome")
  }
}
