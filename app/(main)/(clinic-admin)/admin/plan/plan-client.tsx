"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  CreditCard,
  AlertCircle,
  Crown,
  Users,
  UserRound,
  HardDrive,
  X,
} from "lucide-react"
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
import type { Plan } from "@/types/database"

interface PlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  onSelect: (planId: string) => void
  isLoading: boolean
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

function PlanCard({ plan, isCurrentPlan, onSelect, isLoading }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative transition-all",
        isCurrentPlan && "border-primary ring-2 ring-primary/20"
      )}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
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
            onClick={() => onSelect(plan.id)}
            disabled={isLoading}
          >
            Selecionar este plano
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
  const startedDate = new Date(clinicPlan.started_at)
  const expiresDate = new Date(clinicPlan.expires_at)
  const now = new Date()
  const daysLeft = Math.ceil(
    (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const isExpired = daysLeft <= 0
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7

  const statusLabel =
    clinicPlan.status === "trial"
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
              {expiresDate.toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

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

        {isExpired && (
          <div className="rounded-lg bg-destructive/5 p-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Sua assinatura expirou. Alguns recursos estão bloqueados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PlanManagementClientProps {
  currentPlan: { plan: Plan | null; clinicPlan: ClinicPlan | null }
  availablePlans: Plan[]
}

export function PlanManagementClient({
  currentPlan,
  availablePlans,
}: PlanManagementClientProps) {
  const router = useRouter()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePlanSelect(planId: string) {
    setSelectedPlanId(planId)
    setError(null)
  }

  async function handleConfirmChange() {
    if (!selectedPlanId) return

    setIsLoading(true)
    setError(null)

    const result = await requestPlanChange(selectedPlanId, "monthly")

    if (result.success) {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        router.refresh()
        setSelectedPlanId(null)
      }
    } else {
      setError(result.error ?? "Erro ao alterar plano")
    }

    setIsLoading(false)
  }

  function handleCancel() {
    setSelectedPlanId(null)
    setError(null)
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
          {availablePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onSelect={handlePlanSelect}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {selectedPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmar mudança de plano</CardTitle>
              <CardDescription>
                Tem certeza que deseja trocar para o plano{" "}
                <strong>
                  {availablePlans.find((p) => p.id === selectedPlanId)?.name}
                </strong>
                ?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmChange}
                disabled={isLoading}
              >
                {isLoading ? "Alterando..." : "Confirmar"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import type { ClinicPlan } from "@/types/database"
