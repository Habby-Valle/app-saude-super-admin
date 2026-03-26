import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/clinics',
  '/users',
  '/patients',
  '/checklists',
  '/reports',
  '/settings',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Cria resposta mutável para o Supabase SSR poder atualizar cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // 1. Verificar sessão (refresha token automaticamente via cookies)
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Verificar role via função SECURITY DEFINER (bypassa RLS, sem recursão)
  const { data: role, error: roleError } = await supabase
    .rpc('get_my_role')

  if (roleError || !role) {
    return NextResponse.redirect(new URL('/access-denied', request.url))
  }

  if (role !== 'super_admin') {
    return NextResponse.redirect(new URL('/access-denied', request.url))
  }

  // 3. Acesso autorizado — continua com cookies de sessão atualizados
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
