"use client"

import { AlertTriangle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PaymentFailedBannerProps {
  gracePeriodDaysRemaining: number | null
  daysUntilExpiry: number | null
}

export function PaymentFailedBanner({
  gracePeriodDaysRemaining,
  daysUntilExpiry,
}: PaymentFailedBannerProps) {
  if (gracePeriodDaysRemaining === null) {
    return null
  }

  const isUrgent = gracePeriodDaysRemaining <= 3

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
        isUrgent
          ? "border-destructive/50 bg-destructive/10"
          : "border-amber-500/50 bg-amber-50"
      }`}
    >
      <AlertTriangle
        className={`h-5 w-5 shrink-0 ${isUrgent ? "text-destructive" : "text-amber-600"}`}
      />
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${isUrgent ? "text-destructive" : "text-amber-900"}`}
        >
          Problema com pagamento detectado
        </p>
        <p
          className={`text-xs ${isUrgent ? "text-destructive/80" : "text-amber-700"}`}
        >
          {gracePeriodDaysRemaining > 0
            ? `Sua assinatura será suspensa em ${gracePeriodDaysRemaining} dia${gracePeriodDaysRemaining > 1 ? "s" : ""}. Atualize seu método de pagamento.`
            : "Sua assinatura foi suspensa devido a falhas de pagamento."}
        </p>
      </div>
      <Link href="/admin/plan">
        <Button
          size="sm"
          variant={isUrgent ? "destructive" : "default"}
          className="shrink-0"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isUrgent ? "Atualizar agora" : "Ver plano"}
        </Button>
      </Link>
    </div>
  )
}

interface ExpiringBannerProps {
  daysRemaining: number | null
  status: string
}

export function ExpiringBanner({ daysRemaining, status }: ExpiringBannerProps) {
  if (status !== "trial" && status !== "active") {
    return null
  }

  if (daysRemaining === null || daysRemaining > 7) {
    return null
  }

  const isUrgent = daysRemaining <= 3

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
        isUrgent
          ? "border-destructive/50 bg-destructive/10"
          : "border-amber-500/50 bg-amber-50"
      }`}
    >
      <AlertTriangle
        className={`h-5 w-5 shrink-0 ${isUrgent ? "text-destructive" : "text-amber-600"}`}
      />
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${isUrgent ? "text-destructive" : "text-amber-900"}`}
        >
          {status === "trial"
            ? "Trial expira em breve"
            : "Assinatura expira em breve"}
        </p>
        <p
          className={`text-xs ${isUrgent ? "text-destructive/80" : "text-amber-700"}`}
        >
          {daysRemaining > 0
            ? `Faltam ${daysRemaining} dia${daysRemaining > 1 ? "s" : ""} para o ${status === "trial" ? "trial" : "assinatura"} expirar.`
            : "O período expirou hoje."}
        </p>
      </div>
      <Link href="/admin/plan">
        <Button
          size="sm"
          variant={isUrgent ? "destructive" : "default"}
          className="shrink-0"
        >
          {status === "trial" ? "Ativar plano" : "Renovar"}
        </Button>
      </Link>
    </div>
  )
}
