"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { ClinicSosAcknowledgeDialog, ClinicSosResolveDialog } from "./sos-resolve-dialog"
import type {
  ClinicSosAlertWithDetails,
  SosStatus,
} from "@/app/(main)/(clinic-admin)/admin/sos/actions"

const STATUS_LABELS: Record<SosStatus, string> = {
  active: "Ativo",
  acknowledged: "Confirmado",
  resolved: "Resolvido",
}

const STATUS_VARIANTS: Record<SosStatus, "destructive" | "secondary" | "outline"> = {
  active: "destructive",
  acknowledged: "secondary",
  resolved: "outline",
}

const STATUS_ICONS: Record<SosStatus, React.ReactNode> = {
  active: <AlertTriangle className="mr-1 h-3 w-3" />,
  acknowledged: <Clock className="mr-1 h-3 w-3" />,
  resolved: <CheckCircle2 className="mr-1 h-3 w-3" />,
}

interface ClinicSosTableProps {
  alerts: ClinicSosAlertWithDetails[]
  total: number
  page: number
  pageSize: number
  status: string
  onStatusChange: (v: string) => void
  onPageChange: (v: number) => void
}

export function ClinicSosTable({
  alerts,
  total,
  page,
  pageSize,
  status,
  onStatusChange,
  onPageChange,
}: ClinicSosTableProps) {
  const [acknowledgeTarget, setAcknowledgeTarget] = useState<ClinicSosAlertWithDetails | null>(null)
  const [resolveTarget, setResolveTarget] = useState<ClinicSosAlertWithDetails | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Filtro de status */}
      <div className="flex items-center justify-between">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="acknowledged">Confirmados</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground">
          {total} alerta{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Disparado por</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Confirmado por</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  Nenhum alerta SOS encontrado.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    {alert.patient_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {alert.triggered_by_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANTS[alert.status]}
                      className="flex w-fit items-center"
                    >
                      {STATUS_ICONS[alert.status]}
                      {STATUS_LABELS[alert.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {alert.acknowledged_by_name ? (
                      <span>{alert.acknowledged_by_name}</span>
                    ) : (
                      <span className="text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                    {alert.notes ?? <span className="text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {alert.status === "active" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => setAcknowledgeTarget(alert)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Confirmar recebimento
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {alert.status !== "resolved" && (
                          <DropdownMenuItem
                            onClick={() => setResolveTarget(alert)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Marcar como resolvido
                          </DropdownMenuItem>
                        )}
                        {alert.status === "resolved" && (
                          <DropdownMenuItem disabled>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Alerta resolvido
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <ClinicSosAcknowledgeDialog
        alert={acknowledgeTarget}
        onOpenChange={(open) => {
          if (!open) setAcknowledgeTarget(null)
        }}
      />
      <ClinicSosResolveDialog
        alert={resolveTarget}
        onOpenChange={(open) => {
          if (!open) setResolveTarget(null)
        }}
      />
    </div>
  )
}

export function ClinicSosTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Paciente", "Disparado por", "Status", "Data/Hora", "Confirmado por", "Observações", ""].map(
                (h) => (
                  <TableHead key={h}>{h}</TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
