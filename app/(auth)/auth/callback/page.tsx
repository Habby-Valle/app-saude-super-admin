"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase"
import type { UserRole } from "@/types/database"

const ROLE_DASHBOARD: Record<UserRole, string> = {
  super_admin: "/super-admin/dashboard",
  clinic_admin: "/admin/dashboard",
  caregiver: "/welcome",
  family: "/welcome",
  emergency_contact: "/welcome",
}

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      // Obter hash da URL
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace("#", ""))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      const tokenType = params.get("type")

      // Estabelecer sessão
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user

      if (!user || tokenType !== "invite") {
        // Não é convite ou erro → redireciona para login
        window.location.href = "/login"
        return
      }

      // É convite → verificar status no banco
      const { data: profile } = await supabase
        .from("users")
        .select("status, role")
        .eq("id", user.id)
        .single()

      if (profile?.status === "active") {
        // Já tem senha definida → dashboard
        const role = (profile?.role as UserRole) ?? "clinic_admin"
        window.location.href = ROLE_DASHBOARD[role]
      } else {
        // Pendente → definir senha
        window.location.href = "/accept-invitation"
      }
    }

    handleCallback()
  }, [])

  return null
}
