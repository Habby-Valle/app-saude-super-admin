import { Suspense } from "react"
import { getClinics } from "./actions"
import { ClinicTableClient } from "@/components/super-admin/clinics/clinic-table-client"
import { ClinicTableSkeleton } from "@/components/super-admin/clinics/clinic-table"
import type { ClinicStatus } from "@/types/database"

export const metadata = {
  title: "Clínicas",
}

interface ClinicsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
  }>
}

async function ClinicsContent({ searchParams }: ClinicsPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const status = (params.status ?? "all") as ClinicStatus | "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const { clinics, total } = await getClinics({
    search,
    status,
    page,
    pageSize,
  })

  return (
    <ClinicTableClient
      clinics={clinics}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
    />
  )
}

export default function ClinicsPage(props: ClinicsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clínicas</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie todas as clínicas da plataforma.
        </p>
      </div>

      <Suspense fallback={<ClinicTableSkeleton />}>
        <ClinicsContent {...props} />
      </Suspense>
    </div>
  )
}
