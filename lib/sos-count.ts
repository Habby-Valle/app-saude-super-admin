"use server"

import { requireSuperAdmin, requireClinicAdmin } from "./auth"

// Usado nos layouts server-side para passar o badge count para Sidebar/Topbar

export async function getActiveSosCount(): Promise<number> {
  try {
    const { supabase } = await requireSuperAdmin()
    const { count } = await supabase
      .from("sos_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
    return count ?? 0
  } catch {
    return 0
  }
}

export async function getClinicActiveSosCount(): Promise<number> {
  try {
    const { supabase, clinicId } = await requireClinicAdmin()
    const { count } = await supabase
      .from("sos_alerts")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "active")
    return count ?? 0
  } catch {
    return 0
  }
}
