import { Suspense } from "react"
import { Shield } from "lucide-react"
import {
  getAuditLogs,
  getAuditLogStats,
  getUsersForAuditFilter,
} from "./actions"
import { AuditLogsTable, AuditLogsTableSkeleton } from "./audit-logs-table"

interface AuditLogsPageProps {
  searchParams: Promise<{
    action?: string
    entity?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}

async function AuditLogsContent({ searchParams }: AuditLogsPageProps) {
  const params = await searchParams

  const action = params.action ?? "all"
  const entity = params.entity ?? "all"
  const userId = params.userId ?? "all"
  const dateFrom = params.dateFrom ?? ""
  const dateTo = params.dateTo ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 20

  const [{ logs, total }, stats, users] = await Promise.all([
    getAuditLogs({
      action: action as
        | "all"
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "invite"
        | "activate"
        | "deactivate",
      entity: entity as
        | "all"
        | "clinic"
        | "user"
        | "patient"
        | "checklist"
        | "shift"
        | "system",
      userId,
      dateFrom,
      dateTo,
      page,
      pageSize,
    }),
    getAuditLogStats(),
    getUsersForAuditFilter(),
  ])

  return (
    <AuditLogsTable
      logs={logs}
      total={total}
      page={page}
      pageSize={pageSize}
      filters={{ action, entity, userId, dateFrom, dateTo }}
      users={users}
      stats={stats}
    />
  )
}

export default function AuditLogsPage(props: AuditLogsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Shield className="h-6 w-6" />
          Logs de Auditoria
        </h1>
        <p className="mt-1 text-muted-foreground">
          Rastreie todas as ações críticas realizadas na plataforma.
        </p>
      </div>

      <Suspense fallback={<AuditLogsTableSkeleton />}>
        <AuditLogsContent {...props} />
      </Suspense>
    </div>
  )
}
