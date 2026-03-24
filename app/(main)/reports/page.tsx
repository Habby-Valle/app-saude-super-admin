import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Relatórios consolidados e analytics da plataforma.
        </p>
      </div>
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
        <BarChart3 className="h-10 w-10 opacity-40" />
        <p className="text-sm">Feature 8 — Relatórios e Analytics</p>
      </div>
    </div>
  )
}
