import { Suspense } from "react"
import { getSosAlerts, getSosSummary } from "./actions"
import { getReportClinics } from "../reports/actions"
import { SosTableClient } from "@/components/super-admin/sos/sos-table-client"
import { SosTableSkeleton } from "@/components/super-admin/sos/sos-table"
import {
  SosSummaryCards,
  SosSummaryCardsSkeleton,
} from "@/components/super-admin/sos/sos-summary-cards"
import type { SosStatus } from "./actions"

interface SosPageProps {
  searchParams: Promise<{
    status?: string
    clinicId?: string
    page?: string
  }>
}

async function SosSummarySection({ clinicId }: { clinicId: string }) {
  const summary = await getSosSummary(clinicId !== "all" ? clinicId : undefined)
  return (
    <SosSummaryCards
      active={summary.active}
      acknowledged={summary.acknowledged}
      resolvedToday={summary.resolvedToday}
    />
  )
}

async function SosContent({ searchParams }: SosPageProps) {
  const params = await searchParams
  const status = (params.status ?? "all") as SosStatus | "all"
  const clinicId = params.clinicId ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 20

  const [{ alerts, total }, clinics] = await Promise.all([
    getSosAlerts({ status, clinicId, page, pageSize }),
    getReportClinics(),
  ])

  return (
    <SosTableClient
      alerts={alerts}
      total={total}
      page={page}
      pageSize={pageSize}
      status={status}
      clinicId={clinicId}
      clinics={clinics}
    />
  )
}

export default async function SosPage(props: SosPageProps) {
  const params = await props.searchParams
  const clinicId = params.clinicId ?? "all"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas SOS</h1>
        <p className="mt-1 text-muted-foreground">
          Monitoramento global de alertas de emergência de todas as clínicas.
        </p>
      </div>

      <Suspense fallback={<SosSummaryCardsSkeleton />}>
        <SosSummarySection clinicId={clinicId} />
      </Suspense>

      <Suspense fallback={<SosTableSkeleton />}>
        <SosContent {...props} />
      </Suspense>
    </div>
  )
}
