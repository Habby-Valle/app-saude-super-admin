import { Suspense } from "react"
import { getClinicCaregivers } from "./actions"
import { CaregiverTableClient } from "@/components/clinic-admin/caregivers/caregiver-table-client"
import { CaregiverTableSkeleton } from "@/components/clinic-admin/caregivers/caregiver-table"

interface CaregiversPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

async function CaregiversContent({ searchParams }: CaregiversPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const { caregivers, total } = await getClinicCaregivers({
    search,
    page,
    pageSize,
  })

  return (
    <CaregiverTableClient
      caregivers={caregivers}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
    />
  )
}

export default async function CaregiversPage(props: CaregiversPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cuidadores</h1>
        <p className="mt-1 text-muted-foreground">
          Gestão de cuidadores da clínica.
        </p>
      </div>

      <Suspense fallback={<CaregiverTableSkeleton />}>
        <CaregiversContent {...props} />
      </Suspense>
    </div>
  )
}
