import { Suspense } from "react"
import Link from "next/link"
import {
  Building2,
  Users,
  UserCheck,
  HeartPulse,
  ClipboardCheck,
  Activity,
  AlertTriangle,
} from "lucide-react"

import { getDashboardKPIs, getClinicStats, getRecentActivity } from "./actions"
import {
  KpiCard,
  KpiCardSkeleton,
} from "@/components/super-admin/dashboard/kpi-card"
import {
  ClinicStatsTable,
  ClinicStatsTableSkeleton,
} from "@/components/super-admin/dashboard/clinic-stats-table"
import {
  RecentActivityTable,
  RecentActivityTableSkeleton,
} from "@/components/super-admin/dashboard/recent-activity-table"

export const metadata = {
  title: "Dashboard",
}

// ─── KPI Section ──────────────────────────────────────────────────────────────

async function KpiSection() {
  const kpis = await getDashboardKPIs()
  const totalSosOpen = kpis.activeSosAlerts + kpis.acknowledgedSosAlerts

  return (
    <>
      {/* Banner de alerta SOS — visível apenas quando há alertas ativos */}
      {kpis.activeSosAlerts > 0 && (
        <Link href="/super-admin/sos?status=active">
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm transition-colors hover:bg-destructive/15">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <span className="font-medium text-destructive">
              {kpis.activeSosAlerts} alerta{kpis.activeSosAlerts > 1 ? "s" : ""} SOS ativo
              {kpis.activeSosAlerts > 1 ? "s" : ""} — clique para verificar
            </span>
          </div>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard
          title="Clínicas ativas"
          value={kpis.activeClinics}
          description={`${kpis.totalClinics} cadastradas no total`}
          icon={Building2}
        />
        <KpiCard
          title="Pacientes"
          value={kpis.totalPatients}
          description="Em todas as clínicas"
          icon={HeartPulse}
        />
        <KpiCard
          title="Usuários"
          value={kpis.totalUsers}
          description={`${kpis.totalCaregivers} cuidadores ativos`}
          icon={Users}
        />
        <KpiCard
          title="Turnos em andamento"
          value={kpis.activeShifts}
          description="Agora"
          icon={Activity}
          trend={kpis.activeShifts > 0 ? "up" : "neutral"}
        />
        <KpiCard
          title="Checklists hoje"
          value={kpis.checklistsToday}
          description="Execuções completadas"
          icon={ClipboardCheck}
        />
        <KpiCard
          title="Admins de clínica"
          value={kpis.totalUsers - kpis.totalCaregivers}
          description="Outros roles exceto super_admin"
          icon={UserCheck}
        />
        <KpiCard
          title="Alertas SOS"
          value={totalSosOpen}
          description={
            kpis.activeSosAlerts > 0
              ? `${kpis.activeSosAlerts} ativo${kpis.activeSosAlerts > 1 ? "s" : ""}, ${kpis.acknowledgedSosAlerts} em atendimento`
              : kpis.acknowledgedSosAlerts > 0
                ? `${kpis.acknowledgedSosAlerts} em atendimento`
                : "Nenhum alerta aberto"
          }
          icon={AlertTriangle}
          trend={kpis.activeSosAlerts > 0 ? "down" : "neutral"}
          className={kpis.activeSosAlerts > 0 ? "border-destructive/50 bg-destructive/5" : ""}
        />
      </div>
    </>
  )
}

// ─── Clinic Table Section ─────────────────────────────────────────────────────

async function ClinicSection() {
  const clinics = await getClinicStats()
  return <ClinicStatsTable clinics={clinics} />
}

// ─── Recent Activity Section ──────────────────────────────────────────────────

async function RecentActivitySection() {
  const logs = await getRecentActivity()
  return <RecentActivityTable logs={logs} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral de toda a plataforma App Saúde.
        </p>
      </div>

      {/* KPIs com skeleton enquanto carrega */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <KpiSection />
      </Suspense>

      {/* Tabela de clínicas */}
      <Suspense fallback={<ClinicStatsTableSkeleton />}>
        <ClinicSection />
      </Suspense>

      {/* Histórico de ações recentes */}
      <Suspense fallback={<RecentActivityTableSkeleton />}>
        <RecentActivitySection />
      </Suspense>
    </div>
  )
}
