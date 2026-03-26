import { Suspense } from "react"
import { getClinicPatients } from "./actions"
import { PatientTableClient } from "@/components/clinic-admin/patients/patient-table-client"
import { PatientTableSkeleton } from "@/components/clinic-admin/patients/patient-table"

interface PatientsPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

async function PatientsContent({ searchParams }: PatientsPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const { patients, total } = await getClinicPatients({
    search,
    page,
    pageSize,
  })

  return (
    <PatientTableClient
      patients={patients}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
    />
  )
}

export default async function PatientsPage(props: PatientsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <p className="mt-1 text-muted-foreground">
          Gestão de pacientes da clínica.
        </p>
      </div>

      <Suspense fallback={<PatientTableSkeleton />}>
        <PatientsContent {...props} />
      </Suspense>
    </div>
  )
}
