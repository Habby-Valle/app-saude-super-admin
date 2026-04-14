"use client"

import { useParams, useRouter } from "next/navigation"
import {
  extendTrial,
  updateSubscriptionDates,
  getSubscriptionHistory,
} from "../actions"
import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building2,
  Mail,
  Clock,
  Zap,
  History,
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

interface HistoryEvent {
  id: string
  action: string
  metadata: Record<string, unknown>
  created_at: string
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

interface PlanOption {
  id: string
  name: string
  price: number
  billing_cycle: string
}

export default function SubscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [activating, setActivating] = useState(false)
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly")
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showDatesDialog, setShowDatesDialog] = useState(false)
  const [extendDays, setExtendDays] = useState("14")
  const [newStartsAt, setNewStartsAt] = useState("")
  const [newExpiresAt, setNewExpiresAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)
  const [newPlanId, setNewPlanId] = useState("")
  const [newBillingCycle, setNewBillingCycle] = useState("monthly")

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

  useEffect(() => {
    if (showHistory && subscription?.id) {
      getSubscriptionHistory(subscription.id).then(setHistory)
    }
  }, [showHistory, subscription?.id])

  useEffect(() => {
    if (showActivateDialog || showChangePlanDialog) {
      fetch("/api/plans")
        .then((res) => res.json())
        .then((data) => {
          setAvailablePlans(data.plans || [])
        })
    }
  }, [showActivateDialog, showChangePlanDialog])

  async function handleActivate() {
    if (!selectedPlanId) return

    setActivating(true)
    const response = await fetch("/api/subscriptions/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionId: subscription?.id,
        planId: selectedPlanId,
        billingCycle: selectedBillingCycle,
      }),
    })

    const result = await response.json()
    setActivating(false)

    if (result.success) {
      setShowActivateDialog(false)
      router.refresh()
    } else {
      alert(result.error || "Erro ao ativar assinatura")
    }
  }

  async function handleExtend() {
    if (!subscription) return
    setSaving(true)
    const result = await extendTrial({
      subscriptionId: subscription.id,
      daysToAdd: parseInt(extendDays) || 14,
    })
    setSaving(false)
    if (result.success) {
      setShowExtendDialog(false)
      router.refresh()
    } else {
      alert(result.error || "Erro ao estender Trial")
    }
  }

  async function handleUpdateDates() {
    if (!subscription || !newStartsAt || !newExpiresAt) return
    setSaving(true)
    const result = await updateSubscriptionDates({
      subscriptionId: subscription.id,
      startsAt: newStartsAt,
      expiresAt: newExpiresAt,
    })
    setSaving(false)
    if (result.success) {
      setShowDatesDialog(false)
      router.refresh()
    } else {
      alert(result.error || "Erro ao atualizar datas")
    }
  }

  async function handleChangePlan() {
    if (!subscription || !newPlanId) return

    setChangingPlan(true)
    const response = await fetch(`/api/subscriptions/change-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicId: subscription.clinicId,
        newPlanId,
        billingCycle: newBillingCycle,
      }),
    })

    const result = await response.json()
    setChangingPlan(false)

    if (result.success) {
      setShowChangePlanDialog(false)
      setNewPlanId("")
      router.refresh()
    } else {
      alert(result.error || "Erro ao mudar de plano")
    }
  }

  const canExtend = subscription?.status === "trial"
  const canUpdateDates =
    subscription?.status === "trial" ||
    subscription?.status === "active" ||
    subscription?.status === "free"

  const canActivate =
    subscription?.status === "expired" || subscription?.status === "cancelled"

  // eslint-disable-next-line react-hooks/purity
  const daysRemaining =
    subscription &&
    (subscription.status === "active" || subscription.status === "trial")
      ? Math.ceil(
          (new Date(subscription.expiresAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              Assinatura da clínica {subscription?.clinicName}
            </p>
          </div>
        </div>
        {canExtend && (
          <Button variant="outline" onClick={() => setShowExtendDialog(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Estender Trial
          </Button>
        )}
        {canUpdateDates && (
          <Button
            variant="outline"
            onClick={() => {
              setNewStartsAt(subscription?.startedAt?.slice(0, 10) || "")
              setNewExpiresAt(subscription?.expiresAt?.slice(0, 10) || "")
              setShowDatesDialog(true)
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Alterar Datas
          </Button>
        )}
        {canActivate && (
          <Button onClick={() => setShowActivateDialog(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Ativar Assinatura
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowHistory(true)}>
          <History className="mr-2 h-4 w-4" />
          Histórico
        </Button>
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

      {/* Dialog para ativar assinatura */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar Assinatura</DialogTitle>
            <DialogDescription>
              Ativar assinatura manualmente para {subscription?.clinicName}.
              Isso não requer pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatPrice(plan.price)}/
                      {plan.billing_cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ciclo de Cobrança</Label>
              <Select
                value={selectedBillingCycle}
                onValueChange={setSelectedBillingCycle}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActivateDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivate}
              disabled={!selectedPlanId || activating}
            >
              {activating ? "Ativando..." : "Ativar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para estender trial */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender Trial</DialogTitle>
            <DialogDescription>
              Adicionar dias ao período de Trial da clínica.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dias para adicionar</Label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                placeholder="14"
              />
              <p className="text-xs text-muted-foreground">
                Dias atuais: {daysRemaining ?? "N/A"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExtendDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleExtend} disabled={saving}>
              {saving ? "Salvando..." : "Estender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para alterar datas */}
      <Dialog open={showDatesDialog} onOpenChange={setShowDatesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Datas</DialogTitle>
            <DialogDescription>
              Alterar data de início e expiração da assinatura.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={newStartsAt}
                onChange={(e) => setNewStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Expiração</Label>
              <Input
                type="date"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDatesDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateDates}
              disabled={saving || !newStartsAt || !newExpiresAt}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para mudar de plano */}
      <Dialog
        open={showChangePlanDialog}
        onOpenChange={setShowChangePlanDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar de Plano</DialogTitle>
            <DialogDescription>
              Alterar o plano da clínica. O cálculo pró-rata será aplicado
              automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Plano</Label>
              <Select value={newPlanId} onValueChange={setNewPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans
                    .filter((p) => p.id !== subscription?.planId)
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatPrice(plan.price)}/
                        {formatBillingCycle(plan.billing_cycle)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ciclo de Cobrança</Label>
              <Select
                value={newBillingCycle}
                onValueChange={setNewBillingCycle}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangePlanDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={!newPlanId || changingPlan}
            >
              {changingPlan ? "Alterando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico de Alterações</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                Nenhuma alteração registrada.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((event) => (
                  <div key={event.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {event.action.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(event.created_at),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: ptBR,
                          }
                        )}
                      </span>
                    </div>
                    {event.metadata && (
                      <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistory(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
