"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import type { Plan, ShiftCategory, AlertThreshold } from "@/types/database"

// Estado em memória para demonstração (será perdido ao recarregar) — para shift_categories e alert_thresholds
let mockCategories: ShiftCategory[] = [
  { id: "1", name: "Manhã", color: "#f59e0b", is_active: true },
  { id: "2", name: "Tarde", color: "#3b82f6", is_active: true },
  { id: "3", name: "Noite", color: "#8b5cf6", is_active: true },
  { id: "4", name: "Plantão", color: "#ef4444", is_active: true },
]
let mockAlerts: AlertThreshold[] = [
  {
    id: "1",
    name: "Checklists Pendentes",
    metric: "checklists_pending",
    operator: "gt",
    value: 10,
    message: "Existem muitos checklists pendentes",
    is_active: true,
  },
  {
    id: "2",
    name: "Cuidadores Offline",
    metric: "caregivers_offline",
    operator: "gt",
    value: 5,
    message: "Verifique cuidadores offline",
    is_active: true,
  },
]

// ─── Plans ─────────────────────────────────────────────────────────────────────

export async function getPlans(): Promise<Plan[]> {
  const { supabase } = await requireSuperAdmin()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getPlans] Supabase error:", error)
    return []
  }

  return data ?? []
}

export async function createPlan(
  name: string,
  description: string | null,
  price: number,
  features: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: "Nome é obrigatório" }
  }

  const { supabase } = await requireSuperAdmin()
  const { error } = await supabase.from("plans").insert({
    name: name.trim(),
    description,
    price,
    features,
    is_active: true,
  })

  if (error) {
    console.error("[createPlan] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/super-admin/settings")
  return { success: true }
}

export async function updatePlan(
  id: string,
  name: string,
  description: string | null,
  price: number,
  features: string[],
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: "Nome é obrigatório" }
  }

  const { supabase } = await requireSuperAdmin()
  const { error } = await supabase
    .from("plans")
    .update({ name: name.trim(), description, price, features, is_active })
    .eq("id", id)

  if (error) {
    console.error("[updatePlan] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/super-admin/settings")
  return { success: true }
}

export async function deletePlan(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()
  const { error } = await supabase.from("plans").delete().eq("id", id)

  if (error) {
    console.error("[deletePlan] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/super-admin/settings")
  return { success: true }
}

// ─── Shift Categories ──────────────────────────────────────────────────────────

export async function getShiftCategories(): Promise<ShiftCategory[]> {
  // TODO: Substituir por chamada real ao banco
  return mockCategories
}

export async function createShiftCategory(
  name: string,
  color: string
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: "Nome é obrigatório" }
  }

  // TODO: Substituir por chamada real ao banco
  const newCategory: ShiftCategory = {
    id: Date.now().toString(),
    name: name.trim(),
    color,
    is_active: true,
  }
  mockCategories = [...mockCategories, newCategory]
  return { success: true }
}

export async function updateShiftCategory(
  id: string,
  name: string,
  color: string,
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: "Nome é obrigatório" }
  }

  // TODO: Substituir por chamada real ao banco
  mockCategories = mockCategories.map((c) =>
    c.id === id ? { ...c, name: name.trim(), color, is_active } : c
  )
  return { success: true }
}

export async function deleteShiftCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Substituir por chamada real ao banco
  mockCategories = mockCategories.filter((c) => c.id !== id)
  return { success: true }
}

// ─── Alert Thresholds ──────────────────────────────────────────────────────────

export async function getAlertThresholds(): Promise<AlertThreshold[]> {
  // TODO: Substituir por chamada real ao banco
  return mockAlerts
}

export async function createAlertThreshold(
  name: string,
  metric: string,
  operator: "gt" | "lt" | "eq",
  value: number,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: "Nome é obrigatório" }
  }

  // TODO: Substituir por chamada real ao banco
  const newAlert: AlertThreshold = {
    id: Date.now().toString(),
    name: name.trim(),
    metric,
    operator,
    value,
    message,
    is_active: true,
  }
  mockAlerts = [...mockAlerts, newAlert]
  return { success: true }
}

export async function updateAlertThreshold(
  id: string,
  name: string,
  metric: string,
  operator: "gt" | "lt" | "eq",
  value: number,
  message: string,
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: "Nome é obrigatório" }
  }

  // TODO: Substituir por chamada real ao banco
  mockAlerts = mockAlerts.map((a) =>
    a.id === id
      ? { ...a, name: name.trim(), metric, operator, value, message, is_active }
      : a
  )
  return { success: true }
}

export async function deleteAlertThreshold(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Substituir por chamada real ao banco
  mockAlerts = mockAlerts.filter((a) => a.id !== id)
  return { success: true }
}

// ─── System Settings ──────────────────────────────────────────────────────────

export async function getSystemSettingsAction(): Promise<{
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_planned_end: string | null
}> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("system_settings")
    .select("maintenance_mode, maintenance_message, maintenance_planned_end")
    .maybeSingle()

  if (error || !data) {
    return {
      maintenance_mode: false,
      maintenance_message: "Sistema em manutenção. Em breve retornaremos.",
      maintenance_planned_end: null,
    }
  }

  return {
    maintenance_mode: data.maintenance_mode ?? false,
    maintenance_message:
      data.maintenance_message ??
      "Sistema em manutenção. Em breve retornaremos.",
    maintenance_planned_end: data.maintenance_planned_end,
  }
}

export async function updateSystemSettingsAction(
  maintenance_mode: boolean,
  maintenance_message: string,
  maintenance_planned_end: string | null
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { data: existing } = await supabase
    .from("system_settings")
    .select("id")
    .limit(1)
    .maybeSingle()

  if (!existing?.id) {
    return { success: false, error: "Configuração não encontrada" }
  }

  const { error } = await supabase
    .from("system_settings")
    .update({
      maintenance_mode,
      maintenance_message,
      maintenance_planned_end: maintenance_planned_end || null,
    })
    .eq("id", existing.id)

  if (error) {
    console.error("[updateSystemSettings] Supabase error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/super-admin/settings")
  return { success: true }
}
