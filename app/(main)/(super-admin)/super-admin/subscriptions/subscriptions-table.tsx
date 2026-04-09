"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Filter } from "lucide-react"
import type { SubscriptionWithClinic } from "./actions"

interface SubscriptionsTableProps {
  subscriptions: SubscriptionWithClinic[]
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    trial: "secondary",
    expired: "destructive",
    cancelled: "outline",
  }

  const labels: Record<string, string> = {
    active: "Ativo",
    trial: "Trial",
    expired: "Expirado",
    cancelled: "Cancelado",
  }

  return (
    <Badge variant={variants[status] ?? "outline"}>
      {labels[status] ?? status}
    </Badge>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  try {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return "-"
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

function formatBillingCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  }
  return map[cycle] ?? cycle
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.clinicName.toLowerCase().includes(search.toLowerCase()) ||
      sub.clinicEmail.toLowerCase().includes(search.toLowerCase()) ||
      sub.planName.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar clínica, email ou plano..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clínica</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Dias</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="font-medium">{sub.clinicName}</div>
                    <div className="text-sm text-muted-foreground">
                      {sub.clinicEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sub.planName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(sub.planPrice)} /{" "}
                      {formatBillingCycle(sub.planBillingCycle)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>{formatDate(sub.startedAt)}</TableCell>
                  <TableCell>{formatDate(sub.expiresAt)}</TableCell>
                  <TableCell>
                    {sub.daysRemaining !== null ? (
                      <span
                        className={
                          sub.daysRemaining <= 7
                            ? "font-medium text-red-600"
                            : sub.daysRemaining <= 30
                              ? "text-amber-600"
                              : ""
                        }
                      >
                        {sub.daysRemaining}d
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/super-admin/subscriptions/${sub.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
