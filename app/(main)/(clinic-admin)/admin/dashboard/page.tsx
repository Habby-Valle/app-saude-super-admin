import Link from "next/link"
import {
  Users,
  UserCog,
  CalendarClock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { requireClinicAdmin } from "@/lib/auth"
import { getClinicDashboardStats } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata = {
  title: "Dashboard",
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  variant?: "default" | "destructive"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${
            variant === "destructive"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

function RecentShiftsTable({
  shifts,
}: {
  shifts: Array<{
    id: string
    patient: { id: string; name: string }
    caregiver: { id: string; name: string }
    started_at: string
    ended_at: string | null
    status: string
  }>
}) {
  if (shifts.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nenhum turno registrado ainda.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Cuidador</TableHead>
          <TableHead>Início</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shifts.map((shift) => (
          <TableRow key={shift.id}>
            <TableCell className="font-medium">{shift.patient.name}</TableCell>
            <TableCell>{shift.caregiver.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(shift.started_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  shift.status === "completed"
                    ? "default"
                    : shift.status === "in_progress"
                      ? "secondary"
                      : "outline"
                }
              >
                {shift.status === "completed"
                  ? "Concluído"
                  : shift.status === "in_progress"
                    ? "Em andamento"
                    : "Cancelado"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function DashboardContent() {
  const { user, isSuperAdmin } = await requireClinicAdmin()
  const stats = await getClinicDashboardStats()

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard da Clínica</h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard da Clínica</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.name}
            {isSuperAdmin && (
              <Badge variant="outline" className="ml-2">
                Super Admin
              </Badge>
            )}
          </p>
        </div>
        {stats.clinic && (
          <div className="text-right">
            <p className="text-sm font-medium">{stats.clinic.name}</p>
            <p className="text-xs text-muted-foreground">Clínica</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pacientes"
          value={stats.patients.total}
          subtitle={`${stats.patients.newThisMonth} novos este mês`}
          icon={Users}
        />
        <StatCard
          title="Cuidadores"
          value={stats.caregivers.total}
          subtitle={`${stats.caregivers.active} ativos`}
          icon={UserCog}
        />
        <StatCard
          title="Turnos Hoje"
          value={stats.shifts.today}
          subtitle={`${stats.shifts.completedToday} concluídos`}
          icon={CalendarClock}
        />
        <StatCard
          title="SOS Ativos"
          value={stats.sos.active}
          subtitle={`${stats.sos.pendingToday} pendentes`}
          icon={AlertTriangle}
          variant={stats.sos.active > 0 ? "destructive" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Turnos Recentes</CardTitle>
            <Link
              href="/admin/shifts"
              className="flex cursor-pointer items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <RecentShiftsTable shifts={stats.recentShifts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/patients"
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Gerenciar Pacientes</p>
                <p className="text-xs text-muted-foreground">
                  Cadastrar e editar pacientes
                </p>
              </div>
            </Link>
            <Link
              href="/admin/caregivers"
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <UserCog className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Gerenciar Cuidadores</p>
                <p className="text-xs text-muted-foreground">
                  Alocar cuidadores aos pacientes
                </p>
              </div>
            </Link>
            <Link
              href="/admin/shifts"
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Iniciar Turno</p>
                <p className="text-xs text-muted-foreground">
                  Registrar novo turno de cuidado
                </p>
              </div>
            </Link>
            {stats.sos.active > 0 && (
              <Link
                href="/admin/sos"
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-destructive bg-destructive/10 p-3 transition-colors hover:bg-destructive/20"
              >
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    {stats.sos.active} SOS Ativo
                    {stats.sos.active > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verificar emergência
                  </p>
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function ClinicAdminDashboardPage() {
  return <DashboardContent />
}
