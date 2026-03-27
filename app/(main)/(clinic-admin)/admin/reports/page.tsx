import { Suspense } from "react"
import { getClinicReportSummary } from "./actions"
import {
  ClinicReportsClient,
  ClinicReportsClientSkeleton,
} from "./reports-client"
import { SummaryCards, SummaryCardsSkeleton } from "@/components/clinic-admin/reports/summary-cards"

async function SummarySection() {
  const summary = await getClinicReportSummary()
  return <SummaryCards summary={summary} />
}

export default async function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">
          Relatórios operacionais da clínica
        </p>
      </div>

      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummarySection />
      </Suspense>

      <Suspense fallback={<ClinicReportsClientSkeleton />}>
        <ClinicReportsClient />
      </Suspense>
    </div>
  )
}
