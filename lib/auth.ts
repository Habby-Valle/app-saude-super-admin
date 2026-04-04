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
