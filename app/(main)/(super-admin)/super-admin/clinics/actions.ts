"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { clinicSchema } from "@/lib/validations/clinic"
import type { ClinicFormValues } from "@/lib/validations/clinic"
import type { Clinic, ClinicStatus, User } from "@/types/database"

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
  raw: ClinicFormValues
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

  const { error } = await supabase.from("clinics").insert({
    name,
    cnpj,
    status,
    plan: plan ?? null,
  })

  if (error) {
    console.error("[createClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/clinics")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─── Atualizar clínica ────────────────────────────────────────────────────────

export async function updateClinic(
  id: string,
  raw: ClinicFormValues
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

  const { error } = await supabase
    .from("clinics")
    .update({ name, cnpj, status, plan: plan ?? null })
    .eq("id", id)

  if (error) {
    console.error("[updateClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/clinics")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─── Desativar clínica (soft delete via status) ───────────────────────────────

export async function deactivateClinic(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { error } = await supabase
    .from("clinics")
    .update({ status: "inactive" })
    .eq("id", id)

  if (error) {
    console.error("[deactivateClinic] Supabase error:", error)
    return { success: false, error: error.message }
  }

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
    usersResult,
    checklistsResult,
    shiftsResult,
    shiftsMonthResult,
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("id, name, birth_date, created_at")
      .eq("clinic_id", id)
      .order("name")
      .limit(10),
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

  const caregiverCount = (usersResult.data ?? []).filter(
    (u) => u.role === "caregiver"
  ).length

  return {
    clinic,
    patients: patientsResult.data ?? [],
    users: usersResult.data ?? [],
    checklists: checklistsResult.data ?? [],
    stats: {
      patient_count: patientsResult.count ?? 0,
      user_count: usersResult.count ?? 0,
      caregiver_count: caregiverCount,
      shift_count: shiftsResult.count ?? 0,
      shift_count_month: shiftsMonthResult.count ?? 0,
    },
  }
}
