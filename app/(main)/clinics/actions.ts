"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { clinicSchema } from "@/lib/validations/clinic"
import type { ClinicFormValues } from "@/lib/validations/clinic"
import type { Clinic, ClinicStatus } from "@/types/database"

export interface ClinicsResult {
  clinics: Clinic[]
  total: number
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
  const { name, cnpj, status, plan } = result.data

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
  const { name, cnpj, status, plan } = result.data

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
