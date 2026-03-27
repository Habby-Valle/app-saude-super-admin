"use client"

import { Activity, CheckSquare, Users, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ClinicReportSummary } from "@/app/(main)/(clinic-admin)/admin/reports/actions"

interface SummaryCardsProps {
  summary: ClinicReportSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const completionRate =
    summary.totalShifts > 0
      ? Math.round((summary.completedShifts / summary.totalShifts) * 100)
      : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Turnos
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.totalShifts}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {completionRate}% concluídos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Checklists Concluídos
          </CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.totalChecklistsCompleted}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Total histórico
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pacientes
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.totalPatients}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cuidadores
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.totalCaregivers}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ativos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
