import { Suspense } from "react"
import {
  Building2,
  Users,
  UserCheck,
  HeartPulse,
  ClipboardCheck,
  Activity,
} from "lucide-react"

import { getDashboardKPIs, getClinicStats } from "./actions"
import {
  KpiCard,
  KpiCardSkeleton,
} from "@/components/super-admin/dashboard/kpi-card"
import {
  ClinicStatsTable,
  ClinicStatsTableSkeleton,
} from "@/components/super-admin/dashboard/clinic-stats-table"

export const metadata = {
  title: "Dashboard",
}

// ─── KPI Section ──────────────────────────────────────────────────────────────

async function KpiSection() {
  const kpis = await getDashboardKPIs()

  return (
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
    </div>
  )
}

// ─── Clinic Table Section ─────────────────────────────────────────────────────

async function ClinicSection() {
  const clinics = await getClinicStats()
  return <ClinicStatsTable clinics={clinics} />
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
            {Array.from({ length: 6 }).map((_, i) => (
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
    </div>
  )
}
