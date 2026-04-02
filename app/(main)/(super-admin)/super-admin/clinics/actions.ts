"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { clinicSchema } from "@/lib/validations/clinic"
import type { ClinicFormValues } from "@/lib/validations/clinic"
import type { Clinic, ClinicStatus, User } from "@/types/database"
import { logAuditEvent } from "@/app/(main)/(super-admin)/super-admin/audit-logs/actions"
import { createAdminClient } from "@/lib/supabase-admin"

// ─── Upload de logo (SA usa service role key, bypassa RLS) ────────────────────

export async function uploadClinicLogoSA(
  formData: FormData,
  folderId: string
): Promise<{ success: boolean; logoUrl?: string; error?: string }> {
  await requireSuperAdmin()

  const file = formData.get("logo") as File | null
  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo enviado" }
  }

  const admin = createAdminClient()
  const ext = file.name.split(".").pop() ?? "png"
  const path = `${folderId}/logo.${ext}`

  const bytes = await file.arrayBuffer()
  const { data: uploadData, error: uploadError } = await admin.storage
    .from("clinic-logos")
    .upload(path, bytes, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error("[uploadClinicLogoSA] upload error:", uploadError.message)
    return { success: false, error: "Falha no upload da imagem" }
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("clinic-logos").getPublicUrl(uploadData.path)

  return { success: true, logoUrl: `${publicUrl}?t=${Date.now()}` }
}

export interface ClinicsResult {
  clinics: Clinic[]
  total: number
}

export interface ClinicWithDetails extends Clinic {
  patient_count: number
  user_count: number
  caregiver_count: number
  shift_count: number
}

export interface ClinicDetails {
  clinic: Clinic
  patients: {
    id: string
    name: string
    birth_date: string
    created_at: string
  }[]
  users: {
    id: string
    name: string
    email: string
    role: string
    last_sign_in_at: string | null
  }[]
  checklists: { id: string; name: string; icon: string | null }[]
  stats: {
    patient_count: number
    user_count: number
    caregiver_count: number
    shift_count: number
    shift_count_month: number
  }
}

// ─── Listar clínicas (com busca, filtro, paginação) ───────────────────────────

export async function getClinics(params: {
  search?: string
  status?: ClinicStatus | "all"
  page?: number
  pageSize?: number
}): Promise<ClinicsResult> {
  const { supabase } = await requireSuperAdmin()

  const { search = "", status = "all", page = 1, pageSize = 10 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("clinics")
    .select("*", { count: "exact" })
    .is("deleted_at", null) // exclui clínicas com soft delete
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getClinics] Supabase error:", error)
    throw new Error(error.message)
  }

  return { clinics: data ?? [], total: count ?? 0 }
}

// ─── Criar clínica ────────────────────────────────────────────────────────────

export async function createClinic(
  raw: ClinicFormValues,
  logoUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  const result = clinicSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { supabase } = await requireSuperAdmin()
  const { name, status, plan } = result.data
  const cnpj = result.data.cnpj.replace(/\D/g, "")

  // Verifica CNPJ duplicado
  const { data: existing } = await supabase
    .from("clinics")
    .select("id")
    .eq("cnpj", cnpj)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Já existe uma clínica com este CNPJ" }
  }

  const { data: created, error } = await supabase
    .from("clinics")
    .insert({ name, cnpj, status, plan: plan ?? null, logo_url: logoUrl ?? null })
    .select("id")
    .single()

  if (error) {
    console.error("[createClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("create", "clinic", created.id).catch(() => {})
  revalidatePath("/clinics")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─── Atualizar clínica ────────────────────────────────────────────────────────

export async function updateClinic(
  id: string,
  raw: ClinicFormValues,
  logoUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  const result = clinicSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { supabase } = await requireSuperAdmin()
  const { name, status, plan } = result.data
  const cnpj = result.data.cnpj.replace(/\D/g, "")

  // Verifica CNPJ duplicado em outra clínica
  const { data: existing } = await supabase
    .from("clinics")
    .select("id")
    .eq("cnpj", cnpj)
    .neq("id", id)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Já existe outra clínica com este CNPJ" }
  }

  // Monta payload: logo_url só é alterado se foi passado explicitamente
  const updatePayload: Record<string, unknown> = { name, cnpj, status, plan: plan ?? null }
  if (logoUrl !== undefined) {
    updatePayload.logo_url = logoUrl
  }

  const { error } = await supabase
    .from("clinics")
    .update(updatePayload)
    .eq("id", id)

  if (error) {
    console.error("[updateClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("update", "clinic", id).catch(() => {})
  revalidatePath("/clinics")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─── Atualizar apenas logo_url de uma clínica ─────────────────────────────────
// Usado pelo clinic_admin para gerenciar a logo da própria clínica
export async function updateClinicLogo(
  clinicId: string,
  logoUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { error } = await supabase
    .from("clinics")
    .update({ logo_url: logoUrl })
    .eq("id", clinicId)
    .is("deleted_at", null)

  if (error) {
    console.error("[updateClinicLogo] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("update_logo", "clinic", clinicId).catch(() => {})
  revalidatePath(`/super-admin/clinics/${clinicId}`)
  revalidatePath("/super-admin/clinics")
  return { success: true }
}

// ─── Desativar clínica (status → inactive) ───────────────────────────────────

export async function deactivateClinic(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { error } = await supabase
    .from("clinics")
    .update({ status: "inactive" })
    .eq("id", id)
    .is("deleted_at", null) // nunca alterar uma clínica já deletada

  if (error) {
    console.error("[deactivateClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("deactivate", "clinic", id).catch(() => {})
  revalidatePath("/clinics")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─── Soft delete de clínica (deleted_at = now()) ──────────────────────────────

export async function deleteClinic(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  // Garante que a clínica existe e não foi deletada antes
  const { data: clinic, error: fetchError } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("id", id)
    .is("deleted_at", null)
    .single()

  if (fetchError || !clinic) {
    return { success: false, error: "Clínica não encontrada ou já excluída" }
  }

  const { error } = await supabase
    .from("clinics")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("[deleteClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("delete", "clinic", id).catch(() => {})
  revalidatePath("/clinics")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─── Detalhes de clínica (drill-down) ───────────────────────────────────────────

export async function getClinicById(id: string): Promise<ClinicDetails | null> {
  const { supabase } = await requireSuperAdmin()

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single()

  if (clinicError || !clinic) {
    console.error("[getClinicById] Clinic not found:", clinicError)
    return null
  }

  const now = new Date()
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString()

  const [
    patientsResult,
    patientsTotalResult,
    usersResult,
    checklistsResult,
    shiftsResult,
    shiftsMonthResult,
  ] = await Promise.all([
    // dados para exibição (limitado a 10)
    supabase
      .from("patients")
      .select("id, name, birth_date, created_at")
      .eq("clinic_id", id)
      .order("name")
      .limit(10),
    // contagem real de pacientes (sem limit)
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", id),
    supabase
      .from("users")
      .select("id, name, email, role, last_sign_in_at")
      .eq("clinic_id", id)
      .order("name"),
    supabase
      .from("checklists")
      .select("id, name, icon, clinic_id")
      .eq("clinic_id", id)
      .order("name"),
    supabase
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", id),
    supabase
      .from("shifts")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", id)
      .gte("started_at", monthStart),
  ])

  const allUsers = usersResult.data ?? []
  const caregiverCount = allUsers.filter((u) => u.role === "caregiver").length

  return {
    clinic,
    patients: patientsResult.data ?? [],
    users: allUsers,
    checklists: checklistsResult.data ?? [],
    stats: {
      // usa a query de count dedicada para não ser limitado pelo .limit(10) da query de exibição
      patient_count: patientsTotalResult.count ?? 0,
      // usersResult.data contém todos (sem limit), então .length é o total real
      user_count: allUsers.length,
      caregiver_count: caregiverCount,
      shift_count: shiftsResult.count ?? 0,
      shift_count_month: shiftsMonthResult.count ?? 0,
    },
  }
}
