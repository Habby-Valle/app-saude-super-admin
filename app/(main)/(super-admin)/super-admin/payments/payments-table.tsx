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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, ExternalLink } from "lucide-react"
import type { PaymentWithClinic } from "./actions"

interface PaymentsTableProps {
  payments: PaymentWithClinic[]
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    succeeded: "default",
    pending: "secondary",
    failed: "destructive",
    refunded: "outline",
  }

  const labels: Record<string, string> = {
    succeeded: "Sucesso",
    pending: "Pendente",
    failed: "Falhou",
    refunded: "Estornado",
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
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR })
  } catch {
    return "-"
  }
}

function formatPrice(amount: number, currency: string = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)
}

function formatBillingCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  }
  return map[cycle] ?? cycle
}

function formatPaymentMethod(method: string) {
  const map: Record<string, string> = {
    card: "Cartão",
    pix: "PIX",
    bank_transfer: "Transferência",
  }
  return map[method] ?? method
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = payments.filter((payment) => {
    const matchesSearch =
      payment.clinicName.toLowerCase().includes(search.toLowerCase()) ||
      payment.planName.toLowerCase().includes(search.toLowerCase()) ||
      payment.stripePaymentId?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar clínica, plano ou ID..."
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
            <SelectItem value="succeeded">Sucesso</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
            <SelectItem value="refunded">Estornado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clínica</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">ID Stripe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.clinicName}
                  </TableCell>
                  <TableCell>{payment.planName}</TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {formatPaymentMethod(payment.paymentMethod)}
                  </TableCell>
                  <TableCell>
                    {formatBillingCycle(payment.billingCycle)}
                  </TableCell>
                  <TableCell>{formatDate(payment.paidAt)}</TableCell>
                  <TableCell className="text-right">
                    {payment.stripePaymentId ? (
                      <a
                        href={`https://dashboard.stripe.com/test/payments/${payment.stripePaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        {payment.stripePaymentId.slice(0, 12)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "-"
                    )}
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
