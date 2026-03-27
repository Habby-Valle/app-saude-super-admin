"use client"

import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShiftActionsDialog } from "./shift-actions-dialog"
import { ShiftDialog } from "./shift-dialog"
import type {
  ShiftWithDetails,
  SelectOption,
} from "@/app/(main)/(clinic-admin)/admin/shifts/actions"
import { DataTablePagination } from "@/components/shared/data-table-pagination"

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "—"
  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  if (diffMs < 0) return "—"
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
}

interface ShiftTableProps {
  shifts: ShiftWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  status: string
  patients: SelectOption[]
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onPageChange: (v: number) => void
  onPageSizeChange: (v: number) => void
}

export function ShiftTable({
  shifts,
  total,
  page,
  pageSize,
  search,
  status,
  patients,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
}: ShiftTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou cuidador..."
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ShiftDialog patients={patients} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Cuidador</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  Nenhum turno encontrado.
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {shift.patient_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {shift.caregiver_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(shift.started_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {shift.ended_at ? formatDateTime(shift.ended_at) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDuration(shift.started_at, shift.ended_at)}
                  </TableCell>
                  <TableCell>
                    {shift.status === "in_progress" &&
                    new Date(shift.started_at) > new Date() ? (
                      <Badge variant="outline">Aguardando início</Badge>
                    ) : (
                      <Badge
                        variant={STATUS_VARIANTS[shift.status] ?? "outline"}
                      >
                        {STATUS_LABELS[shift.status] ?? shift.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <ShiftActionsDialog shift={shift} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

export function ShiftTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Paciente",
                "Cuidador",
                "Início",
                "Fim",
                "Duração",
                "Status",
                "",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
