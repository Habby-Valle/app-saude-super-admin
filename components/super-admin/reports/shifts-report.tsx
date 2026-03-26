"use client"

import { BarChart3, Download } from "lucide-react"
import {
  BarChart,
  Bar,
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
import type { ShiftsReportData } from "@/app/(main)/(super-admin)/reports/actions"

interface ShiftsReportProps {
  data: ShiftsReportData[]
  loading: boolean
  onExport: () => void
}

export function ShiftsReport({ data, loading, onExport }: ShiftsReportProps) {
  const totalShifts = data.reduce((sum, d) => sum + d.total, 0)
  const completedShifts = data.reduce((sum, d) => sum + d.completed, 0)
  const cancelledShifts = data.reduce((sum, d) => sum + d.cancelled, 0)

  const chartData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
  }))

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
          <BarChart3 className="h-4 w-4" />
          Turnos por Período
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalShifts}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {completedShifts}
            </p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{cancelledShifts}</p>
            <p className="text-xs text-muted-foreground">Cancelados</p>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="completed"
                  name="Concluídos"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelados"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
