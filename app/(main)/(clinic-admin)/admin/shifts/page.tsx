import { Suspense } from "react"
import {
  getClinicShifts,
  getShiftSelectOptions,
  getShiftTemplates,
} from "./actions"
import { ShiftTableClient } from "@/components/clinic-admin/shifts/shift-table-client"
import { ShiftTableSkeleton } from "@/components/clinic-admin/shifts/shift-table"
import { ShiftTemplatesList } from "@/components/clinic-admin/shifts/shift-templates-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: "Turnos",
}

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

  const [{ shifts, total }, { patients, templates }] = await Promise.all([
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
      templates={templates}
    />
  )
}

async function TemplatesContent() {
  const templates = await getShiftTemplates()
  return <ShiftTemplatesList templates={templates} />
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

      <Tabs defaultValue="shifts" className="w-full">
        <TabsList>
          <TabsTrigger value="shifts">Turnos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="mt-4">
          <Suspense fallback={<ShiftTableSkeleton />}>
            <ShiftsContent {...props} />
          </Suspense>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Suspense fallback={<div>Carregando templates...</div>}>
            <TemplatesContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
