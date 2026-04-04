import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Clock,
  Phone,
  ClipboardCheck,
} from "lucide-react"
import { getPatientById } from "../actions"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const metadata = {
  title: "Detalhes do Paciente",
}

interface PatientDetailsPageProps {
  params: Promise<{ id: string }>
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = parseLocalDate(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

async function PatientDetailsContent({ id }: { id: string }) {
  const details = await getPatientById(id)

  if (!details) {
    notFound()
    return null
  }

  const {
    patient,
    clinic,
    caregivers,
    emergencyContacts,
    executedChecklists,
    stats,
  } = details

  const initials = patient.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <div className="mt-1 flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {calculateAge(patient.birth_date)} anos
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {clinic?.name ?? "—"}
              </span>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href="/super-admin/patients">Editar Paciente</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data de Nascimento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {parseLocalDate(patient.birth_date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Último Turno
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.lastShiftAt ? (
              new Date(stats.lastShiftAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            ) : (
              <span className="text-muted-foreground">
                Nenhum turno registrado
              </span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Turnos
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>{stats.totalShifts}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Cuidadores Vinculados ({caregivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {caregivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum cuidador vinculado.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caregivers.map((caregiver) => (
                      <TableRow key={caregiver.id}>
                        <TableCell className="font-medium">
                          {caregiver.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {caregiver.email}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/users/${caregiver.id}`}>Ver</Link>
                          </Button>
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
              <Phone className="h-4 w-4" />
              Contatos de Emergência ({emergencyContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencyContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum contato de emergência cadastrado.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emergencyContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {contact.phone}
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

      {clinic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Clínica Vinculada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/clinics/${clinic.id}`}
              className="text-primary hover:underline"
            >
              {clinic.name}
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4" />
            Checklists Executados ({stats.totalChecklists})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {executedChecklists.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum checklist executado.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Checklist</TableHead>
                    <TableHead>Cuidador</TableHead>
                    <TableHead>Data do Turno</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executedChecklists.map((sc) => (
                    <TableRow key={sc.id}>
                      <TableCell className="font-medium">
                        {sc.checklist_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sc.caregiver_name}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                        {sc.started_at
                          ? new Date(sc.started_at).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sc.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {sc.status === "completed" ? "Concluído" : "Pendente"}
                        </Badge>
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
  )
}

function PatientDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex flex-1 items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function PatientDetailsPage({
  params,
}: PatientDetailsPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<PatientDetailsSkeleton />}>
        <PatientDetailsContent id={id} />
      </Suspense>
    </div>
  )
}
