'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MobileResetContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'redirecting' | 'fallback'>('redirecting')

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  useEffect(() => {
    if (!tokenHash || type !== 'recovery') {
      setStatus('fallback')
      return
    }

    const deepLink = `zeloapp://reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`

    // Tenta abrir o app via deep link
    window.location.href = deepLink

    // Se após 2s o usuário ainda estiver nesta página, mostra o fallback
    const timer = setTimeout(() => {
      setStatus('fallback')
    }, 2000)

    return () => clearTimeout(timer)
  }, [tokenHash, type])

  const handleOpenApp = () => {
    if (!tokenHash) return
    const deepLink = `zeloapp://reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`
    window.location.href = deepLink
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 text-background"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
        </div>

        {status === 'redirecting' ? (
          <>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Abrindo o Zelo...</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Redirecionando para o aplicativo.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Redefinir senha</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Toque no botão abaixo para abrir o aplicativo Zelo e criar sua nova senha.
              </p>
            </div>

            {tokenHash ? (
              <button
                onClick={handleOpenApp}
                className="w-full rounded-xl bg-foreground px-4 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-80 active:opacity-70"
              >
                Abrir no aplicativo Zelo
              </button>
            ) : (
              <p className="text-sm text-destructive">
                Link inválido ou expirado. Solicite um novo link de recuperação.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function MobileResetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <MobileResetContent />
    </Suspense>
  )
}
