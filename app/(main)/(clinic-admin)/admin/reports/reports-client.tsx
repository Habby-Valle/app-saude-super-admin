"use client"

import { useState, useCallback, useTransition } from "react"
import {
  getClinicShiftsByPeriod,
  getClinicChecklistsByPeriod,
  getClinicPatientsGrowth,
  exportToCsv,
} from "./actions"
import { ClinicReportsFilters } from "@/components/clinic-admin/reports/reports-filters"
import { ClinicShiftsReport } from "@/components/clinic-admin/reports/shifts-report"
import { ClinicChecklistsReport } from "@/components/clinic-admin/reports/checklists-report"
import { ClinicPatientsGrowthReport } from "@/components/clinic-admin/reports/patients-growth-report"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  ShiftsReportData,
  ChecklistsReportData,
  PatientsGrowthData,
} from "./actions"

export function ClinicReportsClient() {
  const [isPending, startTransition] = useTransition()

  const [shiftsData, setShiftsData] = useState<ShiftsReportData[]>([])
  const [checklistsData, setChecklistsData] = useState<ChecklistsReportData[]>([])
  const [patientsData, setPatientsData] = useState<PatientsGrowthData[]>([])

  const loadReports = useCallback(
    (dateRange: { from: string; to: string }) => {
      startTransition(async () => {
        const [shifts, checklists, patients] = await Promise.all([
          getClinicShiftsByPeriod(dateRange),
          getClinicChecklistsByPeriod(dateRange),
          getClinicPatientsGrowth(6),
        ])
        setShiftsData(shifts)
        setChecklistsData(checklists)
        setPatientsData(patients)
      })
    },
    []
  )

  const handleFilterChange = useCallback(
    ({ dateRange }: { dateRange: { from: string; to: string } }) => {
      loadReports(dateRange)
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
      <ClinicReportsFilters onFilterChange={handleFilterChange} />

      <div className="grid gap-6 md:grid-cols-2">
        <ClinicShiftsReport
          data={shiftsData}
          loading={isPending}
          onExport={exportShiftsCsv}
        />
        <ClinicChecklistsReport
          data={checklistsData}
          loading={isPending}
          onExport={exportChecklistsCsv}
        />
      </div>

      <ClinicPatientsGrowthReport
        data={patientsData}
        loading={isPending}
        onExport={exportPatientsCsv}
      />
    </div>
  )
}

export function ClinicReportsClientSkeleton() {
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

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
