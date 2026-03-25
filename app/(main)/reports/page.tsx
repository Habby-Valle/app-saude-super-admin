import { Suspense } from "react"
import { getReportClinics } from "./actions"
import { ReportsClient, ReportsClientSkeleton } from "./reports-client"

async function ReportsContent() {
  const clinics = await getReportClinics()
  return <ReportsClient clinics={clinics} />
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="mt-1 text-muted-foreground">
          Relatórios consolidados e analytics da plataforma.
        </p>
      </div>

      <Suspense fallback={<ReportsClientSkeleton />}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}
