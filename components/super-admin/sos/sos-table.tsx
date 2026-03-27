"use client"

import { useState } from "react"
import { Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { SosAcknowledgeDialog, SosResolveDialog } from "./sos-resolve-dialog"
import type { SosAlertWithDetails, SosStatus } from "@/app/(main)/(super-admin)/super-admin/sos/actions"

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

interface SosTableProps {
  alerts: SosAlertWithDetails[]
  total: number
  page: number
  pageSize: number
  status: string
  clinicId: string
  clinics: { id: string; name: string }[]
  onStatusChange: (v: string) => void
  onClinicChange: (v: string) => void
  onPageChange: (v: number) => void
}

export function SosTable({
  alerts,
  total,
  page,
  pageSize,
  status,
  clinicId,
  clinics,
  onStatusChange,
  onClinicChange,
  onPageChange,
}: SosTableProps) {
  const [acknowledgeTarget, setAcknowledgeTarget] = useState<SosAlertWithDetails | null>(null)
  const [resolveTarget, setResolveTarget] = useState<SosAlertWithDetails | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
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

          <Select value={clinicId} onValueChange={onClinicChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as clínicas</SelectItem>
              {clinics.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              <TableHead>Clínica</TableHead>
              <TableHead>Disparado por</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Confirmado por</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nenhum alerta SOS encontrado.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    {alert.patient_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {alert.clinic_name ?? "—"}
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
                    {alert.acknowledged_by_name ?? (
                      <span className="text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {alert.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setAcknowledgeTarget(alert)}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Confirmar
                        </Button>
                      )}
                      {alert.status !== "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-green-600 hover:text-green-600"
                          onClick={() => setResolveTarget(alert)}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Resolver
                        </Button>
                      )}
                      {alert.status === "resolved" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          Resolvido
                        </span>
                      )}
                    </div>
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

      <SosAcknowledgeDialog
        alert={acknowledgeTarget}
        onOpenChange={(open) => { if (!open) setAcknowledgeTarget(null) }}
      />
      <SosResolveDialog
        alert={resolveTarget}
        onOpenChange={(open) => { if (!open) setResolveTarget(null) }}
      />
    </div>
  )
}

export function SosTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Paciente", "Clínica", "Disparado por", "Status", "Data/Hora", "Confirmado por", ""].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
