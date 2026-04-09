"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExternalLink, CreditCard, AlertCircle, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ManageSubscriptionClientProps {
  clinicName: string
  hasStripeCustomer: boolean
  currentStatus: string | null
}

export function ManageSubscriptionClient({
  clinicName,
  hasStripeCustomer,
  currentStatus,
}: ManageSubscriptionClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleOpenPortal() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao abrir portal")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido"
      toast.error("Erro", { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  const isActive = currentStatus === "active"
  const isTrial = currentStatus === "trial"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Gerenciar Assinatura
        </h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e métodos de pagamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Customer Portal
          </CardTitle>
          <CardDescription>
            Acesse o portal de pagamentos da Stripe para gerenciar sua
            assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasStripeCustomer ? (
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Nenhuma assinatura encontrada</p>
                <p className="text-sm">
                  Você precisa ter uma assinatura ativa para acessar o portal.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                <div className="flex-1">
                  <p className="font-medium">{clinicName}</p>
                  <p className="text-sm text-muted-foreground">
                    Status atual:{" "}
                    <Badge
                      variant={
                        isActive ? "default" : isTrial ? "secondary" : "outline"
                      }
                    >
                      {isActive
                        ? "Ativo"
                        : isTrial
                          ? "Trial"
                          : (currentStatus ?? "Desconhecido")}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No portal você pode:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Visualizar histórico de pagamentos</li>
                  <li>Atualizar método de pagamento</li>
                  <li>Baixar notas fiscais</li>
                  <li>Cancelar assinatura</li>
                </ul>
              </div>

              <Button
                onClick={handleOpenPortal}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir Portal de Pagamentos
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Você será redirecionado para o portal seguro da Stripe.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  )
}
