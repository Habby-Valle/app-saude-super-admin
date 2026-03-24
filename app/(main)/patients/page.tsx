import { UserRound } from 'lucide-react'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground">
          Visão global de todos os pacientes da plataforma.
        </p>
      </div>
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <UserRound className="h-10 w-10 opacity-40" />
        <p className="text-sm">Feature 6 — Gestão de Pacientes</p>
      </div>
    </div>
  )
}
