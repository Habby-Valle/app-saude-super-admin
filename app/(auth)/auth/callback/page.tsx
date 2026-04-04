"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      // Supabase pode enviar tokens via hash na URL (#access_token=...)
      // Precisamos extrair e definir a sessão manualmente.
      const hash = window.location.hash
      if (hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.replace("#", ""))
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")

        if (accessToken && refreshToken) {
          const { error: setSessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

          if (setSessionError) {
            console.error("[callback] setSession error:", setSessionError)
            setError("Erro ao estabelecer sessão. Tente fazer login.")
            return
          }
        }
      }

      // Agora getSession() deve funcionar (sessão definida acima ou via cookie)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      const user = session?.user ?? null

      if (sessionError || !user) {
        setError("Sessão inválida. Tente fazer login.")
        return
      }

      // Busca role e redireciona
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      const role = (profile?.role as UserRole) ?? "clinic_admin"
      const redirectTo = ROLE_DASHBOARD[role] ?? "/"

      // Limpa o hash da URL antes de redirecionar
      window.history.replaceState(null, "", window.location.pathname)
      router.replace(redirectTo)
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex flex-col items-center gap-4">
      {error ? (
        <>
          <p className="text-destructive">{error}</p>
          <a href="/login" className="text-sm underline">
            Voltar ao login
          </a>
        </>
      ) : (
        <p className="text-muted-foreground">Processando seu acesso...</p>
      )}
    </div>
  )
}
