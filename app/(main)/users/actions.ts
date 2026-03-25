"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { inviteUserSchema, updateUserSchema } from "@/lib/validations/user"
import type { InviteUserValues, UpdateUserValues } from "@/lib/validations/user"
import type { User, UserRole } from "@/types/database"

export interface UsersResult {
  users: User[]
  total: number
}

// ─── Listar usuários (com busca, filtro por role/clínica, paginação) ──────────

export async function getUsers(params: {
  search?: string
  role?: UserRole | "all"
  clinic_id?: string | "all"
  page?: number
  pageSize?: number
}): Promise<UsersResult> {
  const { supabase } = await requireSuperAdmin()

  const {
    search = "",
    role = "all",
    clinic_id = "all",
    page = 1,
    pageSize = 10,
  } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .neq("role", "super_admin")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
    )
  }

  if (role !== "all") {
    query = query.eq("role", role)
  }

  if (clinic_id !== "all") {
    query = query.eq("clinic_id", clinic_id)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getUsers]", error)
    throw new Error(error.message)
  }

  return { users: data ?? [], total: count ?? 0 }
}

// ─── Convidar usuário (cria via Supabase Auth + insere perfil) ────────────────

export async function inviteUser(
  raw: InviteUserValues
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()

  const result = inviteUserSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { name, email, role, clinic_id } = result.data
  const admin = createAdminClient()

  // Verifica se email já existe
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "Já existe um usuário com este email" }
  }

  // Envia convite por email via Supabase Auth
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { name },
    })

  if (inviteError || !invited.user) {
    console.error("[inviteUser] auth error:", inviteError)
    return {
      success: false,
      error: inviteError?.message ?? "Erro ao enviar convite",
    }
  }

  // Insere perfil público
  const { error: profileError } = await admin.from("users").insert({
    id: invited.user.id,
    name,
    email,
    role,
    clinic_id: clinic_id ?? null,
    status: "active",
  })

  if (profileError) {
    console.error("[inviteUser] profile error:", profileError)
    // Tenta limpar o auth user criado
    await admin.auth.admin.deleteUser(invited.user.id)
    return { success: false, error: profileError.message }
  }

  revalidatePath("/users")
  return { success: true }
}

// ─── Atualizar usuário (nome, role, clínica) ──────────────────────────────────

export async function updateUser(
  id: string,
  raw: UpdateUserValues
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()

  const result = updateUserSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { name, role, clinic_id } = result.data

  const { error } = await admin
    .from("users")
    .update({ name, role, clinic_id: clinic_id ?? null })
    .eq("id", id)
    .neq("role", "super_admin") // garante que super_admin não seja alterado

  if (error) {
    console.error("[updateUser]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/users")
  return { success: true }
}

// ─── Bloquear / desbloquear usuário ──────────────────────────────────────────

export async function toggleUserStatus(
  id: string,
  currentStatus: "active" | "blocked"
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()

  const newStatus = currentStatus === "active" ? "blocked" : "active"
  const admin = createAdminClient()

  const { error } = await admin
    .from("users")
    .update({ status: newStatus })
    .eq("id", id)
    .neq("role", "super_admin")

  if (error) {
    console.error("[toggleUserStatus]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/users")
  return { success: true }
}
