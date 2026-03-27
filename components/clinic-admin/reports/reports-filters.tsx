"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClinicReportsFiltersProps {
  onFilterChange: (filters: {
    dateRange: { from: string; to: string }
  }) => void
}

const DATE_PRESETS = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este mês", value: "month" },
  { label: "Último mês", value: "lastMonth" },
]

function getDateRange(preset: string): { from: string; to: string } {
  const today = new Date()
  const to = today.toISOString().split("T")[0]
  let from: Date

  switch (preset) {
    case "7d":
      from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30d":
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "month":
      from = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    case "lastMonth": {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        from: from.toISOString().split("T")[0],
        to: lastMonthEnd.toISOString().split("T")[0],
      }
    }
    default:
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { from: from.toISOString().split("T")[0], to }
}

export function ClinicReportsFilters({ onFilterChange }: ClinicReportsFiltersProps) {
  const [datePreset, setDatePreset] = useState("30d")

  const handlePresetChange = (value: string) => {
    setDatePreset(value)
    onFilterChange({ dateRange: getDateRange(value) })
  }

  return (
    <Card className="clinic-admin">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Período</Label>
            <Select value={datePreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
