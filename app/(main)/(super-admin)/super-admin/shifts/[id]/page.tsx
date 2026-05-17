import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  ClipboardList,
} from "lucide-react"

import {
  getShiftById,
  getShiftChecklist,
} from "../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShiftActions } from "./shift-actions"

export const metadata = {
  title: "Detalhes do Turno",
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  in_progress: "default",
  completed: "secondary",
  cancelled: "outline",
}

interface ShiftDetailPageProps {
  params: Promise<{ id: string }>
}

async function ShiftDetailContent({ id }: { id: string }) {
  const [shift, checklists] = await Promise.all([
    getShiftById(id),
    getShiftChecklist(id),
  ])

  if (!shift) {
    notFound()
  }

  const isActive = shift.status === "in_progress"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/shifts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Turno: {shift.patient_name}
            </h1>
            <Badge variant={STATUS_VARIANTS[shift.status]}>
              {STATUS_LABELS[shift.status] ?? shift.status}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Cuidador: {shift.caregiver_name}
            {shift.clinic_name && <> &middot; Clínica: {shift.clinic_name}</>}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {isActive && <ShiftActions shiftId={shift.id} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Período
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Início: </span>
              {formatDateTime(shift.started_at)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Fim: </span>
              {shift.ended_at ? formatDateTime(shift.ended_at) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duração
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-lg font-semibold">
              {formatDuration(shift.started_at, shift.ended_at)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vinculação
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            {shift.clinic_name ? (
              <div className="text-sm">
                <Link
                  href={`/super-admin/clinics/${shift.clinic_id}`}
                  className="text-primary hover:underline"
                >
                  {shift.clinic_name}
                </Link>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              {shift.caregiver_name}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Checklists ({checklists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checklists.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum checklist vinculado a este turno.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Checklist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Concluído em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((cl) => (
                    <TableRow key={cl.id}>
                      <TableCell className="font-medium">
                        {cl.checklist_name}
                      </TableCell>
                      <TableCell>
                        {cl.status === "completed" ? (
                          <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Concluído
                          </Badge>
                        ) : cl.status === "in_progress" ? (
                          <Badge variant="secondary">
                            Em andamento
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="mr-1 h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cl.completed_at
                          ? formatDateTime(cl.completed_at)
                          : "—"}
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

export default async function ShiftDetailPage(props: ShiftDetailPageProps) {
  const { id } = await props.params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-80" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <ShiftDetailContent id={id} />
    </Suspense>
  )
}
