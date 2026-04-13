import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AuthUser } from "@/types/auth"
import type { UserRole } from "@/types/database"

export interface SuperAdminContext {
  user: AuthUser
  supabase: SupabaseClient
}

/**
 * Verifica se o usuário autenticado é super_admin e retorna
 * o cliente Supabase já autenticado para reutilização.
 *
 * Retornar o cliente evita a criação de um segundo cliente
 * nas Server Actions, prevenindo inconsistências de sessão.
 *
 * @throws redirect para /login se não houver sessão
 * @throws redirect para /access-denied se o role não for super_admin
 */
export async function requireSuperAdmin(): Promise<SuperAdminContext> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    redirect("/login")
  }

  // Usa a função SECURITY DEFINER para evitar recursão no RLS
  const { data: role, error: roleError } = await supabase.rpc("get_my_role")

  if (roleError || role !== "super_admin") {
    redirect("/access-denied")
  }

  // Busca perfil completo
  const { data: profile } = await supabase
    .from("users")
    .select("name, email, clinic_id, status")
    .eq("id", user.id)
    .single()

  if (profile?.status === "blocked") {
    await supabase.auth.signOut()
    redirect("/login")
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? "Super Admin",
      role: "super_admin" as UserRole,
      clinic_id: null,
    },
    supabase,
  }
}

export async function logout(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}

export interface ClinicAdminContext {
  user: AuthUser
  clinicId: string
  supabase: SupabaseClient
  isSuperAdmin: boolean
}

export async function requireClinicAdmin(): Promise<ClinicAdminContext> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("name, email, role, clinic_id, status")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/access-denied")
  }

  if (profile.status === "blocked") {
    await supabase.auth.signOut()
    redirect("/login")
  }

  if (profile.role === "super_admin") {
    // Super Admin impersonating a clinic: read clinic ID from the HttpOnly cookie
    const cookieStore = await cookies()
    const clinicId = cookieStore.get("sa-clinic-id")?.value

    if (!clinicId) {
      redirect("/super-admin/clinics")
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? "",
        name: profile.name,
        role: profile.role as UserRole,
        clinic_id: clinicId,
      },
      clinicId,
      supabase,
      isSuperAdmin: true,
    }
  }

  if (profile.role !== "clinic_admin") {
    redirect("/access-denied")
  }

  if (!profile.clinic_id) {
    redirect("/access-denied")
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name: profile.name,
      role: profile.role as UserRole,
      clinic_id: profile.clinic_id,
    },
    clinicId: profile.clinic_id,
    supabase,
    isSuperAdmin: false,
  }
}

export interface SubscriptionStatus {
  isActive: boolean
  status: "trial" | "active" | "expired" | "cancelled" | "free" | null
  expiresAt: string | null
  daysRemaining: number | null
  isTrial: boolean
  lastPlanStatus: "trial" | "active" | "cancelled" | null
}

export async function getClinicSubscriptionStatus(
  clinicId: string
): Promise<SubscriptionStatus> {
  if (!clinicId) {
    return {
      isActive: false,
      status: null,
      expiresAt: null,
      daysRemaining: null,
      isTrial: false,
      lastPlanStatus: null,
    }
  }

  const supabase = await createServerSupabaseClient()

  const { data: clinicPlan, error } = await supabase
    .from("clinic_plans")
    .select("status, expires_at, trial_ends_at")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !clinicPlan) {
    return {
      isActive: false,
      status: null,
      expiresAt: null,
      daysRemaining: null,
      isTrial: false,
      lastPlanStatus: null,
    }
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("last_plan_status")
    .eq("id", clinicId)
    .maybeSingle()

  const isActive =
    clinicPlan.status === "trial" || clinicPlan.status === "active"
  const now = new Date()
  const expiresAt = new Date(clinicPlan.expires_at)
  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    isActive,
    status: clinicPlan.status as "trial" | "active" | "expired" | "cancelled",
    expiresAt: clinicPlan.expires_at,
    daysRemaining: isActive ? daysRemaining : null,
    isTrial: clinicPlan.status === "trial",
    lastPlanStatus: clinic?.last_plan_status as
      | "trial"
      | "active"
      | "cancelled"
      | null,
  }
}

export async function requireActiveSubscription(
  clinicId: string
): Promise<SubscriptionStatus> {
  const subscription = await getClinicSubscriptionStatus(clinicId)

  if (!subscription.isActive) {
    throw new Error("SUBSCRIPTION_EXPIRED")
  }

  return subscription
}
