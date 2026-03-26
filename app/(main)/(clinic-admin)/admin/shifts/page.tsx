import { requireClinicAdmin } from "@/lib/auth"

export default async function ShiftsPage() {
  await requireClinicAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Turnos</h1>
        <p className="text-muted-foreground">Gestão de turnos e registros</p>
      </div>
    </div>
  )
}
