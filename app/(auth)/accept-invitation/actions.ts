"use server"

import { createAdminClient } from "@/lib/supabase-admin"
import {
  acceptInvitationSchema,
  type AcceptInvitationSchema,
} from "@/lib/validations/auth"

export async function acceptInvitation(
  raw: AcceptInvitationSchema & { userId: string }
): Promise<{ success: boolean; error?: string; role?: string }> {
  const result = acceptInvitationSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { userId, password } = raw
  const admin = createAdminClient()

  // Buscar perfil do usuário
  const { data: profile, error: fetchError } = await admin
    .from("users")
    .select("id, name, email, status")
    .eq("id", userId)
    .single()

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      const { data: authUser, error: authError } =
        await admin.auth.admin.getUserById(userId)

      if (authError || !authUser.user) {
        return { success: false, error: "Usuário não encontrado" }
      }

      // Criar perfil
      const { error: insertError } = await admin.from("users").insert({
        id: userId,
        email: authUser.user.email,
        name: authUser.user.user_metadata?.name ?? "",
        status: "pending",
      })

      if (insertError) {
        return { success: false, error: "Erro ao criar perfil" }
      }
    } else {
      return { success: false, error: "Erro ao buscar usuário" }
    }
  }

  // Verificar se já está ativo
  if (profile?.status === "active") {
    return { success: false, error: "Este convite já foi utilizado" }
  }

  // Definir senha via Supabase Auth Admin
  const { error: passwordError } = await admin.auth.admin.updateUserById(
    userId,
    { password }
  )

  if (passwordError) {
    return { success: false, error: "Erro ao definir senha" }
  }

  // Atualizar status para active
  const { error: updateError } = await admin
    .from("users")
    .update({
      status: "active",
      invitation_token: null,
      invitation_expires_at: null,
    })
    .eq("id", userId)

  if (updateError) {
    return { success: false, error: "Erro ao ativar usuário" }
  }

  // Buscar role para retornar
  const { data: updatedProfile } = await admin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  return { success: true, role: updatedProfile?.role }
}