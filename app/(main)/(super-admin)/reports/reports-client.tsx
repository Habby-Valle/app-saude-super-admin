"use client"

import { useState, useCallback, useTransition } from "react"
import {
  getReportClinics,
  getShiftsByPeriod,
  getChecklistsByPeriod,
  getPatientsGrowth,
  exportToCsv,
} from "./actions"
import { ReportsFilters } from "@/components/super-admin/reports/reports-filters"
import { ShiftsReport } from "@/components/super-admin/reports/shifts-report"
import { ChecklistsReport } from "@/components/super-admin/reports/checklists-report"
import { PatientsGrowthReport } from "@/components/super-admin/reports/patients-growth-report"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  ShiftsReportData,
  ChecklistsReportData,
  PatientsGrowthData,
} from "./actions"

interface ReportsClientProps {
  clinics: { id: string; name: string }[]
}

export function ReportsClient({ clinics }: ReportsClientProps) {
  const [isPending, startTransition] = useTransition()

  const [shiftsData, setShiftsData] = useState<ShiftsReportData[]>([])
  const [checklistsData, setChecklistsData] = useState<ChecklistsReportData[]>(
    []
  )
  const [patientsData, setPatientsData] = useState<PatientsGrowthData[]>([])

  const [filters, setFilters] = useState<{
    clinicId: string
    dateRange: { from: string; to: string }
  }>(() => {
    const now = new Date()
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return {
      clinicId: "all",
      dateRange: {
        from: from.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      },
    }
  })

  const loadReports = useCallback((newFilters: typeof filters) => {
    startTransition(async () => {
      const [shifts, checklists, patients] = await Promise.all([
        getShiftsByPeriod(newFilters.dateRange, newFilters.clinicId),
        getChecklistsByPeriod(newFilters.dateRange, newFilters.clinicId),
        getPatientsGrowth(6, newFilters.clinicId),
      ])
      setShiftsData(shifts)
      setChecklistsData(checklists)
      setPatientsData(patients)
    })
  }, [])

  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters)
      loadReports(newFilters)
    },
    [loadReports]
  )

  const exportShiftsCsv = async () => {
    const headers = ["Data", "Total", "Concluídos", "Cancelados"]
    const rows = shiftsData.map((d) => [
      d.date,
      String(d.total),
      String(d.completed),
      String(d.cancelled),
    ])
    const csv = await exportToCsv(headers, rows)
    downloadCsv(csv, "relatorio-turnos.csv")
  }

  const exportChecklistsCsv = async () => {
    const headers = ["Data", "Concluídos", "Pendentes"]
    const rows = checklistsData.map((d) => [
      d.date,
      String(d.completed),
      String(d.pending),
    ])
    const csv = await exportToCsv(headers, rows)
    downloadCsv(csv, "relatorio-checklists.csv")
  }

  const exportPatientsCsv = async () => {
    const headers = ["Mês", "Total", "Novos"]
    const rows = patientsData.map((d) => [
      d.month,
      String(d.total),
      String(d.new),
    ])
    const csv = await exportToCsv(headers, rows)
    downloadCsv(csv, "relatorio-pacientes.csv")
  }

  return (
    <div className="space-y-6">
      <ReportsFilters clinics={clinics} onFilterChange={handleFilterChange} />

      <div className="grid gap-6 md:grid-cols-2">
        <ShiftsReport
          data={shiftsData}
          loading={isPending}
          onExport={exportShiftsCsv}
        />
        <ChecklistsReport
          data={checklistsData}
          loading={isPending}
          onExport={exportChecklistsCsv}
        />
      </div>

      <PatientsGrowthReport
        data={patientsData}
        loading={isPending}
        onExport={exportPatientsCsv}
      />
    </div>
  )
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function ReportsClientSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
