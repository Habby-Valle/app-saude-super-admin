import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configurações globais da plataforma.
        </p>
      </div>
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <Settings className="h-10 w-10 opacity-40" />
        <p className="text-sm">Feature 10 — Configurações Globais</p>
      </div>
    </div>
  )
}
