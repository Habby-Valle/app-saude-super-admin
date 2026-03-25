"use client"

import { CheckSquare, Download } from "lucide-react"
import {
  LineChart,
  Line,
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
import type { ChecklistsReportData } from "@/app/(main)/reports/actions"

interface ChecklistsReportProps {
  data: ChecklistsReportData[]
  loading: boolean
  onExport: () => void
}

export function ChecklistsReport({
  data,
  loading,
  onExport,
}: ChecklistsReportProps) {
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0)
  const totalPending = data.reduce((sum, d) => sum + d.pending, 0)

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
          <CheckSquare className="h-4 w-4" />
          Checklists por Período
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {totalCompleted}
            </p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Concluídos"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e" }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pendentes"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
