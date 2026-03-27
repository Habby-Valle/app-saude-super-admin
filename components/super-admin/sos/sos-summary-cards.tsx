"use client"

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SosSummaryCardsProps {
  active: number
  acknowledged: number
  resolvedToday: number
}

export function SosSummaryCards({ active, acknowledged, resolvedToday }: SosSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className={active > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Alertas Ativos
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${active > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${active > 0 ? "text-destructive" : ""}`}>
            {active}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {active > 0 ? "Requerem atenção imediata" : "Nenhum alerta pendente"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Em Atendimento
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{acknowledged}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Confirmados, aguardando resolução
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Resolvidos Hoje
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{resolvedToday}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Encerrados nas últimas 24h
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function SosSummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-9 w-12" />
            <Skeleton className="mt-2 h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
