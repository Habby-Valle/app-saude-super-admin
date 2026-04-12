"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Check,
  CreditCard,
  AlertCircle,
  Crown,
  Users,
  UserRound,
  HardDrive,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { requestPlanChange } from "./actions"
import type { Plan, ClinicPlan } from "@/types/database"

interface PlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  onSubscribe: (planId: string) => void
  loadingPlanId: string | null
  disabled?: boolean
  disabledReason?: string
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

function formatBillingCycle(cycle: string): string {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  }
  return map[cycle] ?? cycle
}

function PlanCard({
  plan,
  isCurrentPlan,
  onSubscribe,
  loadingPlanId,
  disabled,
  disabledReason,
}: PlanCardProps) {
  const isLoading = loadingPlanId === plan.id

  return (
    <Card
      className={cn(
        "relative transition-all",
        isCurrentPlan && "border-primary ring-2 ring-primary/20",
        disabled && "opacity-60"
      )}
    >
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Plano Atual</Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          {isCurrentPlan && <Crown className="h-5 w-5 text-primary" />}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
          <span className="text-muted-foreground">
            /{formatBillingCycle(plan.billing_cycle).toLowerCase()}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{plan.max_users} usuários</span>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <span>{plan.max_patients} pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span>{plan.max_storage} GB armazenamento</span>
          </div>
        </div>

        {plan.features && plan.features.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Recursos:
            </p>
            <ul className="space-y-1">
              {plan.features.slice(0, 5).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
              {plan.features.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{plan.features.length - 5} mais...
                </li>
              )}
            </ul>
          </div>
        )}

        {!isCurrentPlan && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onSubscribe(plan.id)}
            disabled={isLoading || disabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : disabled ? (
              (disabledReason ?? "Indisponível")
            ) : plan.price === 0 ? (
              "Selecionar plano gratuito"
            ) : (
              "Assinar agora"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface CurrentPlanInfoProps {
  plan: Plan
  clinicPlan: {
    status: string
    started_at: string
    expires_at: string
  }
}

function CurrentPlanInfo({ plan, clinicPlan }: CurrentPlanInfoProps) {
  const isFree = clinicPlan.status === "free"
  const startedDate = new Date(clinicPlan.started_at)
  const expiresDate = clinicPlan.expires_at
    ? new Date(clinicPlan.expires_at)
    : null
  const now = new Date()
  const daysLeft = expiresDate
    ? Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isExpired = daysLeft !== null && daysLeft <= 0
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7

  const statusLabel =
    clinicPlan.status === "free"
      ? "Gratuito"
      : clinicPlan.status === "trial"
        ? "Trial"
        : clinicPlan.status === "active"
          ? "Ativo"
          : clinicPlan.status === "expired"
            ? "Expirado"
            : clinicPlan.status === "cancelled"
              ? "Cancelado"
              : clinicPlan.status

  return (
    <Card className={isExpired ? "border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano Atual
          </div>
          <Badge
            variant={
              isExpired
                ? "destructive"
                : clinicPlan.status === "trial"
                  ? "secondary"
                  : clinicPlan.status === "free"
                    ? "outline"
                    : "default"
            }
          >
            {statusLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">{plan.name}</p>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>

        {!isFree && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">Início</p>
              <p className="font-medium">
                {startedDate.toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vencimento</p>
              <p className="font-medium">
                {expiresDate?.toLocaleDateString("pt-BR") ?? "—"}
              </p>
            </div>
          </div>
        )}

        {isFree && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Plano gratuito com funcionalidades básicas.
            </p>
          </div>
        )}

        {!isFree && daysLeft !== null && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg p-3",
              isExpired
                ? "bg-destructive/10 text-destructive"
                : isExpiringSoon
                  ? "bg-amber-100 text-amber-800"
                  : "bg-primary/10 text-primary"
            )}
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isExpired
                ? "Assinatura expirada. Renove para continuar usando recursos premium."
                : isExpiringSoon
                  ? `Falta ${daysLeft} dia(s). Renove agora para não perder acesso.`
                  : `${daysLeft} dia(s) restante(s)`}
            </span>
          </div>
        )}

        {isExpired && !isFree && (
          <div className="rounded-lg bg-destructive/5 p-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Sua assinatura expirou. Alguns recursos estão bloqueados.
            </p>
          </div>
        )}

        {!isFree && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/plan/manage">Gerenciar Assinatura</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PlanManagementClientProps {
  currentPlan: {
    plan: Plan | null
    clinicPlan: ClinicPlan | null
    hasUsedTrial?: boolean
  }
  availablePlans: Plan[]
}

export function PlanManagementClient({
  currentPlan,
  availablePlans,
}: PlanManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasUsedTrial = currentPlan.hasUsedTrial

  // Handle Stripe checkout return (success/cancel)
  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success === "true") {
      toast.success("Assinatura realizada com sucesso!", {
        description: "Bem-vindo ao seu novo plano.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })
      router.replace("/admin/plan")
    } else if (canceled === "true") {
      toast.info("Checkout cancelado", {
        description: "Sua assinatura não foi alterada.",
        icon: <XCircle className="h-5 w-5 text-muted-foreground" />,
      })
      router.replace("/admin/plan")
    }
  }, [searchParams, router])

  async function handleSubscribe(planId: string) {
    setLoadingPlanId(planId)
    setError(null)

    const result = await requestPlanChange(planId, "monthly")

    if (result.success) {
      if (result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl
      } else {
        // Free plan - already activated
        toast.success("Plano ativado com sucesso!")
        router.refresh()
      }
    } else {
      setError(result.error ?? "Erro ao processar assinatura")
      toast.error(result.error ?? "Erro ao processar assinatura")
    }

    setLoadingPlanId(null)
  }

  const currentPlanId = currentPlan.plan?.id

  return (
    <div className="space-y-8">
      {currentPlan.plan && currentPlan.clinicPlan && (
        <CurrentPlanInfo
          plan={currentPlan.plan}
          clinicPlan={currentPlan.clinicPlan}
        />
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Planos Disponíveis</h2>
          <p className="text-sm text-muted-foreground">
            Escolha o plano ideal para sua clínica.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availablePlans.map((plan) => {
            const isTrial = plan.name === "Trial"
            const trialDisabled = isTrial && hasUsedTrial
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={plan.id === currentPlanId}
                onSubscribe={handleSubscribe}
                loadingPlanId={loadingPlanId}
                disabled={trialDisabled}
                disabledReason={
                  trialDisabled
                    ? "Você já utilizou o Trial anteriormente"
                    : undefined
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
