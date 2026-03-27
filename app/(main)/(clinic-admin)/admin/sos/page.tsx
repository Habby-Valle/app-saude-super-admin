import { Suspense } from "react"
import { getClinicSosAlerts, getClinicSosSummary } from "./actions"
import { ClinicSosTableClient } from "@/components/clinic-admin/sos/sos-table-client"
import { ClinicSosTableSkeleton } from "@/components/clinic-admin/sos/sos-table"
import {
  ClinicSosSummaryCards,
  ClinicSosSummaryCardsSkeleton,
} from "@/components/clinic-admin/sos/sos-summary-cards"
import type { SosStatus } from "./actions"

export const metadata = {
  title: "SOS",
}

interface SosPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

async function ClinicSosSummarySection() {
  const summary = await getClinicSosSummary()
  return (
    <ClinicSosSummaryCards
      active={summary.active}
      acknowledged={summary.acknowledged}
      resolvedToday={summary.resolvedToday}
    />
  )
}

async function ClinicSosContent({ searchParams }: SosPageProps) {
  const params = await searchParams
  const status = (params.status ?? "all") as SosStatus | "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 20

  const { alerts, total } = await getClinicSosAlerts({ status, page, pageSize })

  return (
    <ClinicSosTableClient
      alerts={alerts}
      total={total}
      page={page}
      pageSize={pageSize}
      status={status}
    />
  )
}

export default function SosPage(props: SosPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas SOS</h1>
        <p className="mt-1 text-muted-foreground">
          Alertas de emergência da clínica.
        </p>
      </div>

      <Suspense fallback={<ClinicSosSummaryCardsSkeleton />}>
        <ClinicSosSummarySection />
      </Suspense>

      <Suspense fallback={<ClinicSosTableSkeleton />}>
        <ClinicSosContent {...props} />
      </Suspense>
    </div>
  )
}
