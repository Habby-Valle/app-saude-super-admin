"use client"

import { useState, useTransition } from "react"
import { Copy, Pencil, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import type { ClinicChecklistWithDetails } from "@/app/(main)/(clinic-admin)/admin/checklists/actions"
import { duplicateToClinic } from "@/app/(main)/(clinic-admin)/admin/checklists/actions"
import { ClinicChecklistDialog } from "./checklist-dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { DataTablePagination } from "@/components/shared/data-table-pagination"

interface ClinicChecklistTableProps {
  checklists: ClinicChecklistWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  scope: string
  onSearchChange: (v: string) => void
  onScopeChange: (v: string) => void
  onPageChange: (v: number) => void
  onPageSizeChange: (v: number) => void
}

export function ClinicChecklistTable({
  checklists,
  total,
  page,
  pageSize,
  search,
  scope,
  onSearchChange,
  onScopeChange,
  onPageChange,
  onPageSizeChange,
}: ClinicChecklistTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<
    ClinicChecklistWithDetails | undefined
  >()
  const [duplicateTarget, setDuplicateTarget] =
    useState<ClinicChecklistWithDetails | null>(null)

  const openCreate = () => {
    setEditTarget(undefined)
    setDialogOpen(true)
  }

  const openEdit = (cl: ClinicChecklistWithDetails) => {
    setEditTarget(cl)
    setDialogOpen(true)
  }

  const handleDuplicate = () => {
    if (!duplicateTarget) return
    startTransition(async () => {
      const result = await duplicateToClinic(duplicateTarget.id)
      if (result.success) {
        toast.success("Checklist duplicado com sucesso.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao duplicar")
      }
      setDuplicateTarget(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar checklist..."
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={scope} onValueChange={onScopeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="global">Globais</SelectItem>
              <SelectItem value="mine">Da clínica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo checklist
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Nenhum checklist encontrado.
                </TableCell>
              </TableRow>
            ) : (
              checklists.map((cl) => (
                <TableRow key={cl.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {cl.icon && <span className="text-lg">{cl.icon}</span>}
                      {cl.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cl.is_global ? "default" : "secondary"}>
                      {cl.is_global ? "Global" : "Da clínica"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cl.item_count}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(cl.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/checklists/${cl.id}`}>
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDuplicateTarget(cl)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar para a clínica
                        </DropdownMenuItem>
                        {cl.is_mine && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(cl)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </>
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

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <ClinicChecklistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checklist={editTarget}
      />

      <AlertDialog
        open={!!duplicateTarget}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null)
        }}
      >
        <AlertDialogContent className="clinic-admin">
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicar checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              Criar uma cópia de <strong>{duplicateTarget?.name}</strong> para a
              sua clínica?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate} disabled={isPending}>
              Duplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ClinicChecklistTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="ml-auto h-9 w-36" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Nome", "Origem", "Itens", "Criado em", ""].map((h) => (
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
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-8 rounded-full" />
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
