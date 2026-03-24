import { Building2 } from 'lucide-react'

export default function ClinicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clínicas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as clínicas da plataforma.
        </p>
      </div>
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <Building2 className="h-10 w-10 opacity-40" />
        <p className="text-sm">Feature 4 — Gestão de Clínicas</p>
      </div>
    </div>
  )
}
