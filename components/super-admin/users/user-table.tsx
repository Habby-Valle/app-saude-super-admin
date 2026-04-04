"use client"

import { useState, useTransition, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  MoreHorizontal,
  Pencil,
  ShieldOff,
  ShieldCheck,
  Plus,
  Mail,
  Send,
} from "lucide-react"

import {
  toggleUserStatus,
  resendInvite,
} from "@/app/(main)/(super-admin)/super-admin/users/actions"
import type { User, UserRole } from "@/types/database"
import type { Clinic } from "@/types/database"
import { UserDialog } from "./user-dialog"
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

const ROLE_MAP: Record<UserRole, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin Clínica",
  caregiver: "Cuidador",
  family: "Familiar",
  emergency_contact: "Contato Emergência",
}

interface UserTableProps {
  users: User[]
  total: number
  page: number
  pageSize: number
  search: string
  role: string
  clinicId: string
  clinics: Pick<Clinic, "id" | "name">[]
  onSearchChange: (v: string) => void
  onRoleChange: (v: string) => void
  onClinicChange: (v: string) => void
  onPageChange: (v: number) => void
  onPageSizeChange: (v: number) => void
}

export function UserTable({
  users,
  total,
  page,
  pageSize,
  search,
  role,
  clinicId,
  clinics,
  onSearchChange,
  onRoleChange,
  onClinicChange,
  onPageChange,
  onPageSizeChange,
}: UserTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | undefined>()
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)
  const [resendTarget, setResendTarget] = useState<User | null>(null)

  const openInvite = () => {
    setEditUser(undefined)
    setDialogOpen(true)
  }

  const openEdit = (user: User) => {
    setEditUser(user)
    setDialogOpen(true)
  }

  const handleToggleStatus = useCallback(() => {
    if (!toggleTarget) return
    startTransition(async () => {
      const result = await toggleUserStatus(
        toggleTarget.id,
        toggleTarget.status
      )
      if (result.success) {
        const action =
          toggleTarget.status === "active" ? "bloqueado" : "desbloqueado"
        toast.success(`Usuário "${toggleTarget.name}" ${action}.`)
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao alterar status")
      }
      setToggleTarget(null)
    })
  }, [toggleTarget, router])

  const handleResendInvite = useCallback(() => {
    if (!resendTarget) return
    startTransition(async () => {
      const result = await resendInvite(resendTarget.id)
      if (result.success) {
        toast.success(`Convite reenviado para "${resendTarget.name}".`)
      } else {
        toast.error(result.error ?? "Erro ao reenviar convite")
      }
      setResendTarget(null)
    })
  }, [resendTarget])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por nome ou email..."
            className="max-w-xs min-w-48 flex-1"
          />
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              <SelectItem value="clinic_admin">Admin Clínica</SelectItem>
              <SelectItem value="caregiver">Cuidador</SelectItem>
              <SelectItem value="family">Familiar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={clinicId} onValueChange={onClinicChange}>
            <SelectTrigger className="w-44">
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
        <Button onClick={openInvite} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Convidar usuário
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const clinic = clinics.find((c) => c.id === user.clinic_id)
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/super-admin/users/${user.id}`}
                        className="hover:underline"
                      >
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROLE_MAP[user.role] ?? user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {clinic ? (
                        clinic.name
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status === "active" && (
                        <Badge variant="default">Ativo</Badge>
                      )}
                      {user.status === "blocked" && (
                        <Badge variant="destructive">Bloqueado</Badge>
                      )}
                      {user.status === "pending" && (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString(
                            "pt-BR"
                          )
                        : "—"}
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
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "pending" ? (
                            <DropdownMenuItem
                              onClick={() => setResendTarget(user)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Reenviar convite
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className={
                                user.status === "active"
                                  ? "text-destructive focus:text-destructive"
                                  : ""
                              }
                              onClick={() => setToggleTarget(user)}
                            >
                              {user.status === "active" ? (
                                <>
                                  <ShieldOff className="mr-2 h-4 w-4" />
                                  Bloquear
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Desbloquear
                                </>
                              )}
                            </DropdownMenuItem>
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

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Dialog convite/edição */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) router.refresh()
        }}
        user={editUser}
        clinics={clinics}
      />

      {/* Confirm reenviar convite */}
      <AlertDialog
        open={!!resendTarget}
        onOpenChange={(open) => !open && setResendTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reenviar convite?</AlertDialogTitle>
            <AlertDialogDescription>
              Um novo e-mail de convite será enviado para{" "}
              <strong>{resendTarget?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResendInvite} disabled={isPending}>
              Reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm bloquear/desbloquear */}
      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.status === "active"
                ? "Bloquear usuário?"
                : "Desbloquear usuário?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.status === "active" ? (
                <>
                  <strong>{toggleTarget?.name}</strong> perderá acesso à
                  plataforma imediatamente.
                </>
              ) : (
                <>
                  <strong>{toggleTarget?.name}</strong> voltará a ter acesso à
                  plataforma.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isPending}
              className={
                toggleTarget?.status === "active"
                  ? "text-destructive-foreground bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {toggleTarget?.status === "active" ? "Bloquear" : "Desbloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="ml-auto h-9 w-36" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Nome",
                "Email",
                "Perfil",
                "Clínica",
                "Status",
                "Último acesso",
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
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
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
