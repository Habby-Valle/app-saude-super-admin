import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PowerOff, RotateCcw, Users, Calendar } from "lucide-react"

import {
  getClinicPatientById,
  getPatientCaregivers,
  togglePatientStatus,
} from "../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PatientEditDialog } from "@/components/clinic-admin/patients/patient-edit-dialog"
import { revalidatePath } from "next/cache"

export const metadata = {
  title: "Detalhes do Paciente",
}

// Parseia "YYYY-MM-DD" como data local (evita o offset UTC que recua 1 dia no Brasil)
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

function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return parseLocalDate(dateStr).toLocaleDateString("pt-BR")
  }
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { id } = await params
  const patient = await getClinicPatientById(id)

  if (!patient) {
    notFound()
  }

  const caregivers = await getPatientCaregivers(id)
  const isActive = patient.status !== "inactive"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
            {!isActive && (
              <Badge variant="secondary">Inativo</Badge>
            )}
          </div>
          <p className="text-muted-foreground">Detalhes do paciente</p>
        </div>
        <div className="flex gap-2">
          <PatientEditDialog
            patientId={patient.id}
            patientName={patient.name}
            patientBirthDate={patient.birth_date}
          />

          {isActive ? (
            /* Desativar paciente */
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <PowerOff className="mr-2 h-4 w-4" />
                  Desativar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desativar paciente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O paciente <strong>{patient.name}</strong> será marcado como
                    inativo. Os dados serão preservados e o paciente poderá ser
                    reativado a qualquer momento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <form
                    action={async () => {
                      "use server"
                      await togglePatientStatus(id, "inactive")
                      revalidatePath(`/admin/patients/${id}`)
                    }}
                  >
                    <AlertDialogAction type="submit">
                      Desativar
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            /* Reativar paciente */
            <form
              action={async () => {
                "use server"
                await togglePatientStatus(id, "active")
                revalidatePath(`/admin/patients/${id}`)
              }}
            >
              <Button type="submit" variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reativar
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nome
                </p>
                <p>{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Idade
                </p>
                <p>{calculateAge(patient.birth_date)} anos</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data de Nascimento
                </p>
                <p>{formatDate(patient.birth_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Criado em
                </p>
                <p>{formatDate(patient.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuidadores</CardTitle>
            <CardDescription>Cuidadores vinculados</CardDescription>
          </CardHeader>
          <CardContent>
            {caregivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum cuidador vinculado.
              </p>
            ) : (
              <div className="space-y-3">
                {caregivers.map((caregiver) => (
                  <div
                    key={caregiver.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{caregiver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {caregiver.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/caregivers`}>
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar cuidadores
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turnos</CardTitle>
            <CardDescription>Histórico de turnos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <p className="text-sm">Nenhum turno registrado.</p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/shifts`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver turnos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklists</CardTitle>
            <CardDescription>Checklists executados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Badge variant="outline">0 checklists</Badge>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/checklists`}>Ver checklists</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
