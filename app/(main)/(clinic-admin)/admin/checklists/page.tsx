import { Suspense } from "react"
import { getClinicChecklists } from "./actions"
import { ClinicChecklistTableClient } from "@/components/clinic-admin/checklists/checklist-table-client"
import { ClinicChecklistTableSkeleton } from "@/components/clinic-admin/checklists/checklist-table"

export const metadata = {
  title: "Checklists",
}

interface ChecklistsPageProps {
  searchParams: Promise<{
    search?: string
    scope?: string
    page?: string
  }>
}

async function ChecklistsContent({ searchParams }: ChecklistsPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const scope = (params.scope as "all" | "global" | "mine") ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const { checklists, total } = await getClinicChecklists({
    search,
    scope,
    page,
    pageSize,
  })

  return (
    <ClinicChecklistTableClient
      checklists={checklists}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      scope={scope}
    />
  )
}

export default async function ChecklistsPage(props: ChecklistsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="mt-1 text-muted-foreground">
          Templates globais e checklists personalizados da clínica.
        </p>
      </div>

      <Suspense fallback={<ClinicChecklistTableSkeleton />}>
        <ChecklistsContent {...props} />
      </Suspense>
    </div>
  )
}
