import { Suspense } from "react"
import { getClinicShifts, getShiftSelectOptions } from "./actions"
import { ShiftTableClient } from "@/components/clinic-admin/shifts/shift-table-client"
import { ShiftTableSkeleton } from "@/components/clinic-admin/shifts/shift-table"

interface ShiftsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
  }>
}

async function ShiftsContent({ searchParams }: ShiftsPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const status = params.status ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const [{ shifts, total }, { patients }] = await Promise.all([
    getClinicShifts({ search, status, page, pageSize }),
    getShiftSelectOptions(),
  ])

  return (
    <ShiftTableClient
      shifts={shifts}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      patients={patients}
    />
  )
}

export default async function ShiftsPage(props: ShiftsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
        <p className="mt-1 text-muted-foreground">
          Gestão de turnos de cuidado da clínica.
        </p>
      </div>

      <Suspense fallback={<ShiftTableSkeleton />}>
        <ShiftsContent {...props} />
      </Suspense>
    </div>
  )
}
