"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react"

import {
  acceptInvitationSchema,
  type AcceptInvitationSchema,
} from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { acceptInvitation } from "./actions"

export function AcceptInvitationForm() {
  const router = useRouter()
  const supabase = createClient()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function establishSession() {
      // 1. Ler tokens da hash
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace("#", ""))
      let accessToken = params.get("access_token")
      let refreshToken = params.get("refresh_token")

      // Se não tem na hash, tentar query string
      if (!accessToken) {
        const queryParams = new URLSearchParams(window.location.search)
        accessToken = queryParams.get("access_token")
        refreshToken = queryParams.get("refresh_token")
      }

      // 2. Estabelecer sessão manualmente
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      }

      // 3. Buscar sessão estabelecida
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (user) {
        setUserId(user.id)
      }
      setIsLoading(false)
    }

    establishSession()
  }, [supabase])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationSchema>({
    resolver: zodResolver(acceptInvitationSchema),
  })

  async function onSubmit(data: AcceptInvitationSchema) {
    setServerError(null)

    if (!userId) {
      setServerError("Sessão inválida. Faça login e tente novamente.")
      return
    }

    const result = await acceptInvitation({
      userId,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })

    if (!result.success) {
      setServerError(result.error ?? "Erro desconhecido")
      return
    }

    // Caregiver/Family redirect to /welcome
    if (result.role === "caregiver" || result.role === "family") {
      window.history.replaceState(null, "", "/accept-invitation")
      router.push("/welcome")
      return
    }

    window.history.replaceState(null, "", "/accept-invitation")
    setIsSuccess(true)
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                App Saúde
              </p>
              <p className="text-sm leading-none font-semibold">
                Painel Administrativo
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                App Saúde
              </p>
              <p className="text-sm leading-none font-semibold">
                Painel Administrativo
              </p>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
            <CardDescription className="mt-1">
              Sua conta foi ativada com sucesso.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <AlertDescription>
                Você já pode fazer login com sua senha.
              </AlertDescription>
            </Alert>

            <Button onClick={() => router.push("/login")} className="w-full">
              Ir para login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userId) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                App Saúde
              </p>
              <p className="text-sm leading-none font-semibold">
                Painel Administrativo
              </p>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl">Sessão inválida</CardTitle>
            <CardDescription className="mt-1">
              Este link é inválido ou expirou. Solicite um novo convite.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Button onClick={() => router.push("/login")} className="w-full">
            Ir para login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              App Saúde
            </p>
            <p className="text-sm leading-none font-semibold">
              Painel Administrativo
            </p>
          </div>
        </div>

        <div>
          <CardTitle className="text-2xl">Criar senha</CardTitle>
          <CardDescription className="mt-1">
            Defina sua senha para acessar a plataforma.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirmPassword}
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
