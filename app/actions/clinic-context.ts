"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"

const COOKIE_NAME = "sa-clinic-id"

export async function enterClinicPanel(clinicId: string) {
  // Validate super admin
  await requireSuperAdmin()

  // Validate clinic exists using admin client
  const supabase = createAdminClient()
  const { data: clinic, error } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("id", clinicId)
    .single()

  if (error || !clinic) {
    return { success: false, error: "Clínica não encontrada" }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, clinicId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })

  redirect("/admin/dashboard")
}

export async function exitClinicPanel() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect("/super-admin/clinics")
}
