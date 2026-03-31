"use client"

import { useState, useTransition, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  MoreHorizontal,
  Pencil,
  PowerOff,
  Plus,
  Eye,
  LogIn,
} from "lucide-react"

import { deactivateClinic } from "@/app/(main)/(super-admin)/super-admin/clinics/actions"
import { enterClinicPanel } from "@/app/actions/clinic-context"
import type { Clinic, ClinicStatus } from "@/types/database"
import { ClinicDialog } from "./clinic-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/shared/search-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTablePagination } from "@/components/shared/data-table-pagination"

const STATUS_MAP: Record<
  ClinicStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  active: { label: "Ativa", variant: "default" },
  inactive: { label: "Inativa", variant: "secondary" },
  suspended: { label: "Suspensa", variant: "destructive" },
}

function formatCnpj(cnpj: string) {
  const d = cnpj.replace(/\D/g, "")
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

interface ClinicTableProps {
  clinics: Clinic[]
  total: number
  page: number
  pageSize: number
  search: string
  status: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onPageChange: (v: number) => void
  onPageSizeChange: (v: number) => void
}

export function ClinicTable({
  clinics,
  total,
  page,
  pageSize,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
}: ClinicTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editClinic, setEditClinic] = useState<Clinic | undefined>()
  const [deactivateTarget, setDeactivateTarget] = useState<Clinic | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  const openCreate = () => {
    setEditClinic(undefined)
    setDialogOpen(true)
  }

  const openEdit = (clinic: Clinic) => {
    setEditClinic(clinic)
    setDialogOpen(true)
  }

  const handleDeactivate = useCallback(() => {
    if (!deactivateTarget) return
    startTransition(async () => {
      const result = await deactivateClinic(deactivateTarget.id)
      if (result.success) {
        toast.success(`Clínica "${deactivateTarget.name}" desativada.`)
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao desativar")
      }
      setDeactivateTarget(null)
    })
  }, [deactivateTarget, router])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar clínica..."
            className="max-w-xs flex-1"
          />
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
              <SelectItem value="suspended">Suspensas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova clínica
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Nenhuma clínica encontrada.
                </TableCell>
              </TableRow>
            ) : (
              clinics.map((clinic) => {
                const s = STATUS_MAP[clinic.status] ?? {
                  label: clinic.status,
                  variant: "outline" as const,
                }
                return (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/super-admin/clinics/${clinic.id}`}
                        className="hover:underline"
                      >
                        {clinic.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCnpj(clinic.cnpj)}
                    </TableCell>
                    <TableCell>
                      {clinic.plan ? (
                        <span className="text-sm">{clinic.plan}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(clinic.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              startTransition(async () => {
                                await enterClinicPanel(clinic.id)
                              })
                            }}
                            disabled={isPending}
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Acessar painel
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEdit(clinic)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {clinic.status !== "inactive" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeactivateTarget(clinic)}
                              >
                                <PowerOff className="mr-2 h-4 w-4" />
                                Desativar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Dialog criação/edição */}
      <ClinicDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) router.refresh()
        }}
        clinic={editClinic}
      />

      {/* Confirm desativar */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              A clínica <strong>{deactivateTarget?.name}</strong> será marcada
              como inativa. Os dados não serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ClinicTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="ml-auto h-9 w-32" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Nome", "CNPJ", "Plano", "Status", "Criada em", ""].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
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
