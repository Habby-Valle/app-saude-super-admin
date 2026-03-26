import { requireClinicAdmin } from "@/lib/auth"

export default async function SosPage() {
  await requireClinicAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sistema SOS</h1>
        <p className="text-muted-foreground">
          Alertas de emergência da clínica
        </p>
      </div>
    </div>
  )
}
