import { Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie administradores e usuários da plataforma.
        </p>
      </div>
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <Users className="h-10 w-10 opacity-40" />
        <p className="text-sm">Feature 5 — Gestão de Usuários</p>
      </div>
    </div>
  )
}
