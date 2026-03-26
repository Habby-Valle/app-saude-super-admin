import { requireClinicAdmin } from "@/lib/auth"

export default async function ChecklistsPage() {
  await requireClinicAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checklists</h1>
        <p className="text-muted-foreground">Checklists da clínica</p>
      </div>
    </div>
  )
}
