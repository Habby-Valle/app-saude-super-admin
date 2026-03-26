"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react"

import type { ChecklistWithDetails } from "@/app/(main)/(super-admin)/checklists/actions"
import {
  deleteChecklist,
  duplicateChecklist,
} from "@/app/(main)/(super-admin)/checklists/actions"
import { ChecklistDialog } from "./checklist-dialog"
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
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTransition } from "react"

interface ChecklistTableProps {
  checklists: ChecklistWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  scope: string
  clinics: { id: string; name: string }[]
  onSearchChange: (v: string) => void
  onScopeChange: (v: string) => void
  onPageChange: (v: number) => void
}

export function ChecklistTable({
  checklists,
  total,
  page,
  pageSize,
  search,
  scope,
  clinics,
  onSearchChange,
  onScopeChange,
  onPageChange,
}: ChecklistTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editChecklist, setEditChecklist] = useState<
    ChecklistWithDetails | undefined
  >()

  const openEdit = (cl: ChecklistWithDetails) => {
    setEditChecklist(cl) // Passa o objeto completo
    setDialogOpen(true)
  }
  const [deleteTarget, setDeleteTarget] = useState<ChecklistWithDetails | null>(
    null
  )
  const [duplicateTarget, setDuplicateTarget] =
    useState<ChecklistWithDetails | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  const openCreate = () => {
    setEditChecklist(undefined)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteChecklist(deleteTarget.id)
      if (result.success) {
        toast.success("Template excluído com sucesso.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao excluir")
      }
      setDeleteTarget(null)
    })
  }

  const handleDuplicate = () => {
    if (!duplicateTarget) return
    startTransition(async () => {
      const result = await duplicateChecklist(
        duplicateTarget.id,
        duplicateTarget.clinic_id
      )
      if (result.success) {
        toast.success("Template duplicado com sucesso.")
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
              placeholder="Buscar template..."
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
              <SelectItem value="clinic">Por clínica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo template
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Escopo</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Nenhum template encontrado.
                </TableCell>
              </TableRow>
            ) : (
              checklists.map((cl) => {
                const isGlobal = cl.clinic_id === null
                return (
                  <TableRow key={cl.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {cl.icon && <span className="text-lg">{cl.icon}</span>}
                        {cl.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isGlobal ? "default" : "secondary"}>
                        {isGlobal ? "Global" : "Clínica"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cl.clinic_name ? (
                        <span className="text-sm">{cl.clinic_name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <span className="sr-only">Abrir menu</span>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="5"
                                r="1"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="1"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="19"
                                r="1"
                                fill="currentColor"
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/checklists/${cl.id}`}>
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(cl)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDuplicateTarget(cl)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(cl)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} template{total !== 1 ? "s" : ""} encontrado
            {total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ChecklistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checklist={editChecklist} // Passa o estado
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              O template <strong>{deleteTarget?.name}</strong> será excluído
              permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!duplicateTarget}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicar template?</AlertDialogTitle>
            <AlertDialogDescription>
              Criar uma cópia de <strong>{duplicateTarget?.name}</strong>?
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

export function ChecklistTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="ml-auto h-9 w-32" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["Nome", "Escopo", "Clínica", "Itens", "Criado em", ""].map(
                (h) => (
                  <TableHead key={h}>{h}</TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
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
