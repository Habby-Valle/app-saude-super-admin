"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase"
import type { UserRole } from "@/types/database"

const ROLE_DASHBOARD: Record<UserRole, string> = {
  super_admin: "/super-admin/dashboard",
  clinic_admin: "/admin/dashboard",
  guardian: "/access-denied",
  caregiver: "/welcome",
  family: "/welcome",
  emergency_contact: "/welcome",
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export default function AuthCallbackPage() {
  useEffect(() => {
    const hash = window.location.hash

    if (hash) {
      const params = new URLSearchParams(hash.replace("#", ""))
      const tokenType = params.get("type")

      // Mobile: redireciona para o app via deep link conforme o tipo de token
      if (isMobileDevice()) {
        const appRoute = tokenType === "recovery" ? "reset-password" : "accept-invite"
        window.location.href = `zeloapp://${appRoute}${hash}`
        return
      }
    }

    async function handleCallback() {
      const supabase = createClient()

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
        const role = (profile?.role as UserRole) ?? "clinic_admin"
        window.location.href = ROLE_DASHBOARD[role]
      } else {
        window.location.href = "/accept-invitation"
      }
    }

    if (!isMobileDevice()) {
      handleCallback()
    }
  }, [])

  return null
}
