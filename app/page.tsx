import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"
import type { UserRole } from "@/types/database"

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

  switch (role) {
    case "super_admin":
      redirect("/super-admin/dashboard")
    case "clinic_admin":
      redirect("/admin/dashboard")
    default:
      redirect("/welcome")
  }
}
