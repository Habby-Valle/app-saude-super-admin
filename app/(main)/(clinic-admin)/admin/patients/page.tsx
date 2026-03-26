import { requireClinicAdmin } from "@/lib/auth"

export default async function PatientsPage() {
  await requireClinicAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <p className="text-muted-foreground">Gestão de pacientes da clínica</p>
      </div>
    </div>
  )
}
