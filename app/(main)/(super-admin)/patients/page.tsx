import { Suspense } from "react"
import { getPatients, getClinicsForFilter } from "./actions"
import { PatientTableClient } from "@/components/patients/patient-table-client"
import { PatientTableSkeleton } from "@/components/patients/patient-table"

interface PatientsPageProps {
  searchParams: Promise<{
    search?: string
    clinic?: string
    page?: string
  }>
}

async function PatientsContent({ searchParams }: PatientsPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const clinicId = params.clinic ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const [{ patients, total }, clinics] = await Promise.all([
    getPatients({ search, clinicId, page, pageSize }),
    getClinicsForFilter(),
  ])

  return (
    <PatientTableClient
      patients={patients}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      clinicId={clinicId}
      clinics={clinics}
    />
  )
}

export default function PatientsPage(props: PatientsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <p className="mt-1 text-muted-foreground">
          Visão global de todos os pacientes da plataforma.
        </p>
      </div>

      <Suspense fallback={<PatientTableSkeleton />}>
        <PatientsContent {...props} />
      </Suspense>
    </div>
  )
}
