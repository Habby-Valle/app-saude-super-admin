"use client"

import { Users, TrendingUp, Download } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { PatientsGrowthData } from "@/app/(main)/reports/actions"

interface PatientsGrowthReportProps {
  data: PatientsGrowthData[]
  loading: boolean
  onExport: () => void
}

export function PatientsGrowthReport({
  data,
  loading,
  onExport,
}: PatientsGrowthReportProps) {
  const totalPatients = data.length > 0 ? data[data.length - 1].total : 0
  const newPatients = data.reduce((sum, d) => sum + d.new, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Crescimento de Pacientes
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalPatients}</p>
            <p className="text-xs text-muted-foreground">Total de pacientes</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <TrendingUp className="h-5 w-5" />
              {newPatients}
            </p>
            <p className="text-xs text-muted-foreground">Novos (período)</p>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="new"
                  name="Novos"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
