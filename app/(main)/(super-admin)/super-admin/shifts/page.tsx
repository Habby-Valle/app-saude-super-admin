import { Suspense } from "react"
import { getShifts } from "./actions"
import { ShiftTableClient } from "@/components/super-admin/shifts/shift-table-client"
import { ShiftTableSkeleton } from "@/components/super-admin/shifts/shift-table"
import { requireSuperAdmin } from "@/lib/auth"

export const metadata = {
  title: "Turnos — Super Admin",
}

interface ShiftsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    clinicId?: string
    page?: string
  }>
}

async function ShiftsContent({ searchParams }: ShiftsPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const status = params.status ?? "all"
  const clinicId = params.clinicId ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const { supabase } = await requireSuperAdmin()

  const [{ shifts, total }, clinicsResult] = await Promise.all([
    getShifts({ search, status, clinicId, page, pageSize }),
    supabase
      .from("clinics")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
  ])

  const clinics = (clinicsResult.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  return (
    <ShiftTableClient
      shifts={shifts}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      clinicId={clinicId}
      clinics={clinics}
    />
  )
}

export default async function ShiftsPage(props: ShiftsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
        <p className="mt-1 text-muted-foreground">
          Visualize e gerencie turnos de todas as clínicas.
        </p>
      </div>

      <Suspense fallback={<ShiftTableSkeleton />}>
        <ShiftsContent {...props} />
      </Suspense>
    </div>
  )
}
