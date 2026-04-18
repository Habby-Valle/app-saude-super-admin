"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingState } from "./loading-state"
import { WelcomeIcon } from "./welcome-icon"
import { WelcomeContent } from "./welcome-content"
import { createClient } from "@/lib/supabase"
import type { UserRole } from "@/types/database"

const ROLE_REDIRECT: Record<UserRole, string> = {
  super_admin: "/login",
  clinic_admin: "/login",
  caregiver: "/welcome",
  family: "/welcome",
  emergency_contact: "/login",
}

type DetectedRole = UserRole | null

export default function WelcomePage() {
  const router = useRouter()
  const [detectedRole, setDetectedRole] = useState<DetectedRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function redirect() {
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setIsLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      const role = profile?.role as UserRole
      setDetectedRole(role)
      setIsLoading(false)

      if (role) {
        const destination = ROLE_REDIRECT[role] ?? "/welcome"
        if (destination && destination !== "/login") {
          router.replace(destination)
        }
      }
    }

    redirect()
  }, [router])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f6f4fe] via-white to-[#f6f4fe] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <WelcomeIcon />
        <WelcomeContent role={detectedRole} />
        <p className="text-xs text-[#9999bb]">
          Em caso de dúvidas, entre em contato com o administrador da sua clínica.
        </p>
      </div>
    </div>
  )
}
