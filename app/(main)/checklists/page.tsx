import { Suspense } from "react"
import { getChecklists, getClinicsForChecklist } from "./actions"
import { ChecklistTableClient } from "@/components/checklists/checklist-table-client"
import { ChecklistTableSkeleton } from "@/components/checklists/checklist-table"

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
  const scope = (params.scope ?? "all") as "all" | "global" | "clinic"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const [{ checklists, total }, clinics] = await Promise.all([
    getChecklists({ search, scope, page, pageSize }),
    getClinicsForChecklist(),
  ])

  return (
    <ChecklistTableClient
      checklists={checklists}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      scope={scope}
      clinics={clinics}
    />
  )
}

export default function ChecklistsPage(props: ChecklistsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie templates de checklists globais e por clínica.
        </p>
      </div>

      <Suspense fallback={<ChecklistTableSkeleton />}>
        <ChecklistsContent {...props} />
      </Suspense>
    </div>
  )
}
