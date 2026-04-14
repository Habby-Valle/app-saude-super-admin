"use client"

import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueMetrics {
  mrr: number
  arr: number
  expected30Days: number
  forecast: { month: string; revenue: number }[]
  activeSubscriptions: number
  trialSubscriptions: number
}

interface RevenueForecastCardsProps {
  metrics: RevenueMetrics
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function RevenueForecastCards({ metrics }: RevenueForecastCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MRR</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.mrr)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.activeSubscriptions} assinaturas ativas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ARR</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.arr)}
          </div>
          <p className="text-xs text-muted-foreground">
            receita anual projetada
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximos 30 dias
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.expected30Days)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.trialSubscriptions} em trial
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Forecast 6 meses
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(
              metrics.forecast.reduce((sum, f) => sum + f.revenue, 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">receita prevista</p>
        </CardContent>
      </Card>
    </div>
  )
}
