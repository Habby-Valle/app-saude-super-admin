"use server"

// TODO: Criar tabelas no Supabase:
// - plans (id, name, description, price, features, is_active, created_at)
// - shift_categories (id, name, color, is_active)
// - alert_thresholds (id, name, metric, operator, value, message, is_active)

// DADOS MOCKADOS - Substituir por chamadas ao banco quando as tabelas existirem
const MOCK_PLANS: Plan[] = [
  {
    id: "1",
    name: "Básico",
    description: "Para clínicas pequenas",
    price: 99.9,
    features: [
      "Até 5 cuidadores",
      "10 pacientes",
      "Checklists básicos",
      "Relatórios simples",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Profissional",
    description: "Para clínicas médias",
    price: 199.9,
    features: [
      "Até 20 cuidadores",
      "50 pacientes",
      "Checklists avançados",
      "Relatórios completos",
      "Suporte prioritário",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Enterprise",
    description: "Para grandes redes",
    price: 499.9,
    features: [
      "Cuidadores ilimitados",
      "Pacientes ilimitados",
      "Checklists personalizados",
      "Relatórios avançados",
      "API integrações",
      "Suporte 24/7",
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

const MOCK_SHIFT_CATEGORIES: ShiftCategory[] = [
  { id: "1", name: "Manhã", color: "#f59e0b", is_active: true },
  { id: "2", name: "Tarde", color: "#3b82f6", is_active: true },
  { id: "3", name: "Noite", color: "#8b5cf6", is_active: true },
  { id: "4", name: "Plantão", color: "#ef4444", is_active: true },
]

const MOCK_ALERT_THRESHOLDS: AlertThreshold[] = [
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

// Estado em memória para演示 (será perdido ao recarregar)
let mockPlans = [...MOCK_PLANS]
let mockCategories = [...MOCK_SHIFT_CATEGORIES]
let mockAlerts = [...MOCK_ALERT_THRESHOLDS]

export interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  features: string[]
  is_active: boolean
  created_at: string
}

export interface ShiftCategory {
  id: string
  name: string
  color: string
  is_active: boolean
}

export interface AlertThreshold {
  id: string
  name: string
  metric: string
  operator: "gt" | "lt" | "eq"
  value: number
  message: string
  is_active: boolean
}

export async function getPlans(): Promise<Plan[]> {
  // TODO: Substituir por chamada real ao banco
  // const { supabase } = await requireSuperAdmin()
  // const { data, error } = await supabase.from("plans").select("*").order("price")
  return mockPlans
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

  // TODO: Substituir por chamada real ao banco
  // const { supabase } = await requireSuperAdmin()
  // const { error } = await supabase.from("plans").insert({...})

  const newPlan: Plan = {
    id: Date.now().toString(),
    name: name.trim(),
    description,
    price,
    features,
    is_active: true,
    created_at: new Date().toISOString(),
  }
  mockPlans = [...mockPlans, newPlan]
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

  // TODO: Substituir por chamada real ao banco
  // const { supabase } = await requireSuperAdmin()
  // const { error } = await supabase.from("plans").update({...}).eq("id", id)

  mockPlans = mockPlans.map((p) =>
    p.id === id
      ? { ...p, name: name.trim(), description, price, features, is_active }
      : p
  )
  return { success: true }
}

export async function deletePlan(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Substituir por chamada real ao banco
  mockPlans = mockPlans.filter((p) => p.id !== id)
  return { success: true }
}

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
