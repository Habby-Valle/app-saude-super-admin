"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building2,
  Mail,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface SubscriptionDetails {
  id: string
  clinicId: string
  clinicName: string
  clinicEmail: string
  planId: string
  planName: string
  planDescription: string
  planPrice: number
  planBillingCycle: string
  status: string
  startedAt: string
  expiresAt: string
  trialEndsAt: string | null
  createdAt: string
  maxUsers: number
  maxPatients: number
  features: string[]
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  try {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return "-"
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

function formatBillingCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  }
  return map[cycle] ?? cycle
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    trial: "secondary",
    expired: "destructive",
    cancelled: "outline",
  }

  const labels: Record<string, string> = {
    active: "Ativo",
    trial: "Trial",
    expired: "Expirado",
    cancelled: "Cancelado",
  }

  return (
    <Badge variant={variants[status] ?? "outline"}>
      {labels[status] ?? status}
    </Badge>
  )
}

export default function SubscriptionDetailPage() {
  const params = useParams()
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      const response = await fetch(`/api/subscriptions/${params.id}`)
      const data = await response.json()
      setSubscription(data)
      setLoading(false)
    }

    if (params.id) {
      fetchSubscription()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Assinatura não encontrada</p>
        <Link href="/super-admin/subscriptions">
          <Button variant="link">Voltar para assinaturas</Button>
        </Link>
      </div>
    )
  }

  const daysRemaining =
    subscription.status === "active" || subscription.status === "trial"
      ? Math.ceil(
          (new Date(subscription.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/subscriptions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Detalhes da Assinatura
          </h1>
          <p className="text-muted-foreground">
            Assinatura da clínica {subscription.clinicName}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{subscription.clinicName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                {subscription.clinicEmail || "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{subscription.planName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(subscription.planPrice)} /{" "}
                  {formatBillingCycle(subscription.planBillingCycle)}
                </p>
              </div>
              <StatusBadge status={subscription.status} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Máx. Usuários</p>
                <p className="font-medium">{subscription.maxUsers}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Máx. Pacientes</p>
                <p className="font-medium">{subscription.maxPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vigência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="font-medium">
                  {formatDate(subscription.startedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expira em</p>
                <p className="font-medium">
                  {formatDate(subscription.expiresAt)}
                </p>
              </div>
            </div>
            {subscription.trialEndsAt && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Trial termina em
                </p>
                <p className="font-medium">
                  {formatDate(subscription.trialEndsAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dias restantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {daysRemaining !== null ? (
              <div>
                <p
                  className={`text-3xl font-bold ${
                    daysRemaining <= 7
                      ? "text-red-600"
                      : daysRemaining <= 30
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {daysRemaining} dias
                </p>
                <p className="text-sm text-muted-foreground">
                  {daysRemaining <= 0 ? "Expirado" : "restantes"}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {subscription.status === "cancelled"
                  ? "Assinatura cancelada"
                  : "Assinatura expirada"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features do Plano */}
      {subscription.features && subscription.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subscription.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
