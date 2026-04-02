"use server"

import { revalidatePath } from "next/cache"
import { requireClinicAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { CLINIC_THEMES, type ClinicThemeId } from "@/lib/clinic-themes"

/**
 * Faz upload da logo para o Supabase Storage usando service role key
 * (bypassa RLS) e atualiza logo_url na clínica do admin autenticado.
 */
export async function uploadAndUpdateClinicLogo(
  formData: FormData
): Promise<{ success: boolean; logoUrl?: string; error?: string }> {
  const { clinicId } = await requireClinicAdmin()

  const file = formData.get("logo") as File | null
  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo enviado" }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "A imagem deve ter no máximo 2MB" }
  }

  const admin = createAdminClient()
  const ext = file.name.split(".").pop() ?? "png"
  const path = `${clinicId}/logo.${ext}`

  const bytes = await file.arrayBuffer()
  const { data: uploadData, error: uploadError } = await admin.storage
    .from("clinic-logos")
    .upload(path, bytes, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error("[uploadAndUpdateClinicLogo] upload error:", uploadError.message)
    return { success: false, error: "Falha no upload da imagem" }
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("clinic-logos").getPublicUrl(uploadData.path)

  const logoUrl = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await admin
    .from("clinics")
    .update({ logo_url: logoUrl })
    .eq("id", clinicId)

  if (updateError) {
    console.error("[uploadAndUpdateClinicLogo] update error:", updateError.message)
    return { success: false, error: updateError.message }
  }

  revalidatePath("/admin/settings")
  revalidatePath("/admin/dashboard")
  return { success: true, logoUrl }
}

/**
 * Remove a logo da clínica (define logo_url como null).
 */
export async function removeClinicLogo(): Promise<{ success: boolean; error?: string }> {
  const { clinicId } = await requireClinicAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from("clinics")
    .update({ logo_url: null })
    .eq("id", clinicId)

  if (error) {
    console.error("[removeClinicLogo] error:", error.message)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/settings")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

/**
 * Atualiza o tema de cores da clínica.
 */
export async function updateClinicTheme(
  themeId: ClinicThemeId
): Promise<{ success: boolean; error?: string }> {
  const { clinicId } = await requireClinicAdmin()

  const valid = CLINIC_THEMES.some((t) => t.id === themeId)
  if (!valid) {
    return { success: false, error: "Tema inválido" }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("clinics")
    .update({ theme_color: themeId })
    .eq("id", clinicId)

  if (error) {
    console.error("[updateClinicTheme] error:", error.message)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/settings")
  revalidatePath("/admin", "layout")
  return { success: true }
}

/**
 * Retorna os dados básicos da clínica do admin autenticado.
 */
export async function getMyClinic(): Promise<{
  id: string
  name: string
  logo_url: string | null
  theme_color: string | null
} | null> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("clinics")
    .select("id, name, logo_url, theme_color")
    .eq("id", clinicId)
    .is("deleted_at", null)
    .single()

  if (error) {
    console.error("[getMyClinic] Supabase error:", error.message, error.code)
    return null
  }
  if (!data) return null

  return data
}
