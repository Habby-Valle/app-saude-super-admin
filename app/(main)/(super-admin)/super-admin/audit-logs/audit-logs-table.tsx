"use client"

import { useCallback, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Download, Shield } from "lucide-react"
import type { AuditLogWithUser } from "./actions"
import { exportAuditLogsCsv } from "./actions"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AuditLogsTableProps {
  logs: AuditLogWithUser[]
  total: number
  page: number
  pageSize: number
  filters: {
    action: string
    entity: string
    userId: string
    clinicId: string
    dateFrom: string
    dateTo: string
  }
  users: { id: string; name: string; email: string }[]
  clinicas: { id: string; name: string }[]
  stats: {
    total: number
    today: number
    byAction: Record<string, number>
  }
}

const ACTION_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  login: "outline",
  logout: "outline",
  invite: "default",
  activate: "default",
  deactivate: "secondary",
}

const ACTION_LABELS: Record<string, string> = {
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  login: "Login",
  logout: "Logout",
  invite: "Convite",
  activate: "Ativação",
  deactivate: "Desativação",
}

const ENTITY_LABELS: Record<string, string> = {
  clinic: "Clínica",
  user: "Usuário",
  patient: "Paciente",
  checklist: "Checklist",
  shift: "Turno",
  system: "Sistema",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AuditLogsTable({
  logs,
  total,
  page,
  pageSize,
  filters,
  users,
  clinicas,
  stats,
}: AuditLogsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending] = useTransition()

  const totalPages = Math.ceil(total / pageSize)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = {
        action: filters.action,
        entity: filters.entity,
        userId: filters.userId,
        clinicId: filters.clinicId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        page: String(page),
      }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all" && v !== "1" && k !== "page") {
          params.set(k, v)
        } else if (k === "page" && v !== "1") {
          params.set(k, v)
        }
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, filters, page]
  )

  const handleExport = async () => {
    const csv = await exportAuditLogsCsv({
      action: filters.action as
        | "all"
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "invite"
        | "activate"
        | "deactivate",
      entity: filters.entity as
        | "all"
        | "clinic"
        | "user"
        | "patient"
        | "checklist"
        | "shift"
        | "system",
      userId: filters.userId,
      clinicId: filters.clinicId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.total.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.today.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ações de Criação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {(stats.byAction["create"] ?? 0).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ações de Exclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {(stats.byAction["delete"] ?? 0).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Logs de Auditoria
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select
              value={filters.action}
              onValueChange={(v) => updateParams({ action: v, page: "1" })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="invite">Convite</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.entity}
              onValueChange={(v) => updateParams({ entity: v, page: "1" })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas entidades</SelectItem>
                <SelectItem value="clinic">Clínica</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
                <SelectItem value="shift">Turno</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.userId}
              onValueChange={(v) => updateParams({ userId: v, page: "1" })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos usuários</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.clinicId}
              onValueChange={(v) => updateParams({ clinicId: v, page: "1" })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Clínica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas clínicas</SelectItem>
                {clinicas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  updateParams({ dateFrom: e.target.value, page: "1" })
                }
                className="w-36"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  updateParams({ dateTo: e.target.value, page: "1" })
                }
                className="w-36"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Nenhum log encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.user_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_COLORS[log.action] ?? "outline"}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ENTITY_LABELS[log.entity] ?? log.entity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.entity_id
                          ? log.entity_id.slice(0, 8) + "..."
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {total.toLocaleString("pt-BR")} registros encontrado
                {total !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isPending}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  Anterior
                </Button>
                <span>
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isPending}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function AuditLogsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
