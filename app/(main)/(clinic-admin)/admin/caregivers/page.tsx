import { requireClinicAdmin } from "@/lib/auth"

export default async function CaregiversPage() {
  await requireClinicAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cuidadores</h1>
        <p className="text-muted-foreground">Gestão de cuidadores da clínica</p>
      </div>
    </div>
  )
}
