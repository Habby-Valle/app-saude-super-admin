"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SubscriptionStatus } from "@/lib/auth"

interface SubscriptionBannerProps {
  subscription: SubscriptionStatus
}

export function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
  const router = useRouter()
  const [showTrialExpiredBanner, setShowTrialExpiredBanner] = useState(false)

  useEffect(() => {
    const wasTrial = subscription.lastPlanStatus === "trial"
    const isFree = subscription.status === "free"
    const alreadyShown = sessionStorage.getItem("trial_expired_banner_shown")

    if (wasTrial && isFree && !alreadyShown) {
      setShowTrialExpiredBanner(true)
      sessionStorage.setItem("trial_expired_banner_shown", "true")
    }
  }, [subscription.lastPlanStatus, subscription.status])

  const handleDismiss = () => {
    setShowTrialExpiredBanner(false)
  }

  const isExpired =
    subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === null
  const isExpiringSoon =
    subscription.daysRemaining !== null &&
    subscription.daysRemaining <= 7 &&
    subscription.daysRemaining > 0 &&
    subscription.isActive

  const hasPaymentFailed = subscription.paymentFailed
  const isInGracePeriod =
    subscription.gracePeriodDaysRemaining !== null &&
    subscription.gracePeriodDaysRemaining > 0

  if (showTrialExpiredBanner) {
    return (
      <div className="border-b border-amber-300 bg-amber-50 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">
              Seu Trial expirou. Agora você está no plano Free.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-800 hover:bg-amber-100"
              onClick={() => router.push("/admin/plan")}
            >
              Ver planos <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-transparent"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (hasPaymentFailed) {
    const isUrgent = (subscription.gracePeriodDaysRemaining ?? 0) <= 3
    return (
      <div
        className={`border-b px-4 py-2 ${
          isUrgent
            ? "border-destructive/50 bg-destructive/10"
            : "border-amber-500/50 bg-amber-50"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div
            className={`flex items-center gap-2 text-sm ${
              isUrgent ? "text-destructive" : "text-amber-800"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">
              {isUrgent
                ? "Assinatura suspensa - Payment failed"
                : `Problema com pagamento - ${subscription.gracePeriodDaysRemaining} dias para resolver`}
            </span>
          </div>
          <Button
            size="sm"
            variant={isUrgent ? "destructive" : "default"}
            onClick={() => router.push("/admin/plan")}
          >
            {isUrgent ? "Atualizar agora" : "Ver plano"}
          </Button>
        </div>
      </div>
    )
  }

  if (subscription.isActive && !isExpiringSoon) {
    return null
  }

  if (isExpired) {
    return (
      <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">
              {subscription.status === null
                ? "Nenhuma assinatura ativa."
                : "Sua assinatura expirou."}
            </span>
          </div>
          <Button size="sm" onClick={() => router.push("/admin/plan")}>
            Assinar agora <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (isExpiringSoon) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {subscription.isTrial
                ? `Seu trial expira em ${subscription.daysRemaining} dia${subscription.daysRemaining === 1 ? "" : "s"}. `
                : `Assinatura expira em ${subscription.daysRemaining} dia${subscription.daysRemaining === 1 ? "" : "s"}. `}
              Renove agora para não perder acesso.
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100 hover:text-amber-900"
            onClick={() => router.push("/admin/plan")}
          >
            Renovar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return null
}

interface SubscriptionBadgeProps {
  subscription: SubscriptionStatus
}

export function SubscriptionBadge({ subscription }: SubscriptionBadgeProps) {
  if (!subscription.isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Expirada
      </span>
    )
  }

  if (subscription.isTrial) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
        Trial
        {subscription.daysRemaining !== null && (
          <span className="ml-1">({subscription.daysRemaining}d)</span>
        )}
      </span>
    )
  }

  if (subscription.daysRemaining !== null && subscription.daysRemaining <= 7) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
        <AlertTriangle className="h-3 w-3" />
        {subscription.daysRemaining}d
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
      <CheckCircle className="h-3 w-3" />
      Ativa
    </span>
  )
}
