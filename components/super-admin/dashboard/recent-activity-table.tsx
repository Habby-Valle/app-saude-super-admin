import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Clock } from 'lucide-react'
import type { RecentActivity } from '@/app/(main)/(super-admin)/super-admin/dashboard/actions'

const ACTION_LABELS: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
  invite: 'Convite',
  activate: 'Ativação',
  deactivate: 'Desativação',
}

const ENTITY_LABELS: Record<string, string> = {
  clinic: 'Clínica',
  user: 'Usuário',
  patient: 'Paciente',
  checklist: 'Checklist',
  shift: 'Turno',
  system: 'Sistema',
}

interface RecentActivityTableProps {
  logs: RecentActivity[]
}

export function RecentActivityTable({ logs }: RecentActivityTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Histórico de Ações Recentes
        </CardTitle>
        <Link
          href="/super-admin/audit-logs"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.user_name}</div>
                      <div className="text-xs text-muted-foreground">{log.user_email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ENTITY_LABELS[log.entity] ?? log.entity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function RecentActivityTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
