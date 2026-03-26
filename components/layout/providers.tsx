"use client"

import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { createClient } from "@/lib/supabase"
import { useAuthStore } from "@/store/auth-store"
import { Toaster } from "@/components/ui/sonner"
import type { AuthUser } from "@/types/auth"
import type { UserRole } from "@/types/database"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser()


      if (sessionError || !user) {
        clear()
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("name, role, clinic_id")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        clear()
        return
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email ?? "",
        name: profile.name as string,
        role: profile.role as UserRole,
        clinic_id: profile.clinic_id as string | null,
      }
      setUser(authUser)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          clear()
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("name, role, clinic_id")
          .eq("id", session.user.id)
          .single()

        if (profileError || !profile) {
          clear()
          return
        }

        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          name: profile.name as string,
          role: profile.role as UserRole,
          clinic_id: profile.clinic_id as string | null,
        })
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [setUser, clear])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
