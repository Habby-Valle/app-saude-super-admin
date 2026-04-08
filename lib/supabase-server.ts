import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

/**
 * Server-side Supabase client com suporte a cookies SSR.
 * Use apenas em Server Components e Server Actions.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components não podem definir cookies diretamente.
          // O middleware cuida do refresh da sessão.
        }
      },
    },
  })
}

/**
 * Server-side Supabase client para API Routes.
 * Recebe a requisição para extrair cookies corretamente.
 */
export function createServerSupabaseClientForRoute(req: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value)
        })
        const response = NextResponse.next()
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options })
        })
      },
    },
  })
}
