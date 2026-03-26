import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ClinicStat } from '@/app/(main)/(super-admin)/super-admin/dashboard/actions'

interface ClinicStatsTableProps {
  clinics: ClinicStat[]
}

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativa', variant: 'default' },
  inactive: { label: 'Inativa', variant: 'secondary' },
  suspended: { label: 'Suspensa', variant: 'destructive' },
}

export function ClinicStatsTable({ clinics }: ClinicStatsTableProps) {
  if (!clinics.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clínicas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma clínica cadastrada ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clínicas (top 10)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Pacientes</TableHead>
              <TableHead className="text-right">Cuidadores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics.map((clinic) => {
              const status = STATUS_LABEL[clinic.status] ?? {
                label: clinic.status,
                variant: 'outline' as const,
              }
              return (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {clinic.patientCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {clinic.caregiverCount}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ClinicStatsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {['Nome', 'Status', 'Pacientes', 'Cuidadores'].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-8" /></TableCell>
                <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
