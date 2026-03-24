import { ClipboardList } from 'lucide-react'

export default function ChecklistsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
        <p className="text-muted-foreground">
          Gerencie templates de checklists globais.
        </p>
      </div>
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <ClipboardList className="h-10 w-10 opacity-40" />
        <p className="text-sm">Feature 7 — Checklists Globais</p>
      </div>
    </div>
  )
}
