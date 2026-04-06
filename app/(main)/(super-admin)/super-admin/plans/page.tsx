import { Suspense } from "react"
import { getPlans } from "./actions"
import { PlanTableClient } from "@/components/super-admin/plans/plan-table-client"

export const metadata = {
  title: "Planos",
}

interface PlansPageProps {
  searchParams: Promise<{
    search?: string
    isActive?: string
    page?: string
  }>
}

async function PlansContent({ searchParams }: PlansPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const isActive = params.isActive ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const isActiveFilter = isActive === "all" ? null : isActive === "true"

  const { plans, total } = await getPlans({
    search,
    isActive: isActiveFilter,
    page,
    pageSize,
  })

  return (
    <PlanTableClient
      plans={plans}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      isActive={isActive}
    />
  )
}

export default function PlansPage(props: PlansPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie os planos de assinatura da plataforma.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">Carregando...</div>
        }
      >
        <PlansContent {...props} />
      </Suspense>
    </div>
  )
}
