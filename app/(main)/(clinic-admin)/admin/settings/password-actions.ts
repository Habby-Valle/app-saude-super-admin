"use server"

import { requireClinicAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"

export async function changeClinicAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!currentPassword || !newPassword) {
    return { success: false, error: "Todos os campos são obrigatórios" }
  }

  if (newPassword.length < 6) {
    return { success: false, error: "A nova senha deve ter no mínimo 6 caracteres" }
  }

  if (currentPassword === newPassword) {
    return { success: false, error: "A nova senha deve ser diferente da atual" }
  }

  const { user } = await requireClinicAdmin()

  // Update the user's password using the admin client
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (error) {
    console.error("[changeClinicAdminPassword] Admin update error:", error.message)
    return { success: false, error: "Falha ao alterar a senha" }
  }

  return { success: true }
}