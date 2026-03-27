import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Users,
  UserRound,
  ClipboardList,
  Calendar,
  BadgeCheck,
} from "lucide-react"
import { getClinicById } from "../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  title: "Detalhes da Clínica",
}

interface ClinicDetailsPageProps {
  params: Promise<{ id: string }>
}

const ROLE_LABELS: Record<string, string> = {
  clinic_admin: "Admin",
  caregiver: "Cuidador",
  family: "Família",
  super_admin: "Super Admin",
}

const STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

async function ClinicDetailsContent({ id }: { id: string }) {
  const details = await getClinicById(id)

  if (!details) {
    notFound()
  }

  const { clinic, patients, users, checklists, stats } = details

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/clinics">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{clinic.name}</h1>
            <Badge variant={STATUS_COLORS[clinic.status] ?? "outline"}>
              {clinic.status === "active"
                ? "Ativa"
                : clinic.status === "inactive"
                  ? "Inativa"
                  : "Suspensa"}
            </Badge>
          </div>
          <p className="text-muted-foreground">CNPJ: {clinic.cnpj}</p>
        </div>
        <Button asChild>
          <Link href={`/clinics`}>Editar Clínica</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes
            </CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patient_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cuidadores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.caregiver_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Turnos (mês)
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shift_count_month}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checklists
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklists.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4" />
              Pacientes Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum paciente cadastrado.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Desde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <Link href={`/patients`} className="hover:underline">
                            {patient.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {calculateAge(patient.birth_date)} anos
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(patient.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Usuários ({stats.user_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum usuário cadastrado.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Último Acesso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ROLE_LABELS[user.role] ?? user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString(
                                "pt-BR"
                              )
                            : "Nunca"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Checklists Configurados ({checklists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checklists.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum checklist configurado.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {checklists.map((checklist) => (
                <Badge
                  key={checklist.id}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {checklist.icon && (
                    <span className="mr-1">{checklist.icon}</span>
                  )}
                  {checklist.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ClinicDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function ClinicDetailsPage({
  params,
}: ClinicDetailsPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ClinicDetailsSkeleton />}>
        <ClinicDetailsContent id={id} />
      </Suspense>
    </div>
  )
}
