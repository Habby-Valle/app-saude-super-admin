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
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportsFiltersProps {
  clinics: { id: string; name: string }[]
  onFilterChange: (filters: {
    clinicId: string
    dateRange: { from: string; to: string }
  }) => void
}

const DATE_PRESETS = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este mês", value: "month" },
  { label: "Último mês", value: "lastMonth" },
  { label: "Personalizado", value: "custom" },
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
    case "lastMonth":
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        from: from.toISOString().split("T")[0],
        to: lastMonthEnd.toISOString().split("T")[0],
      }
    default:
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { from: from.toISOString().split("T")[0], to }
}

export function ReportsFilters({
  clinics,
  onFilterChange,
}: ReportsFiltersProps) {
  const [clinicId, setClinicId] = useState("all")
  const [datePreset, setDatePreset] = useState("30d")

  const handleClinicChange = (value: string) => {
    setClinicId(value)
    onFilterChange({
      clinicId: value,
      dateRange: getDateRange(datePreset),
    })
  }

  const handlePresetChange = (value: string) => {
    setDatePreset(value)
    onFilterChange({
      clinicId,
      dateRange: getDateRange(value),
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Clínica</Label>
            <Select value={clinicId} onValueChange={handleClinicChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as clínicas</SelectItem>
                {clinics.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Período</Label>
            <Select value={datePreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-40">
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
