"use client"

import { useState } from "react"
import { User } from "lucide-react"
import type { PatientWithDetails } from "@/app/(main)/patients/actions"
import { getPatientCaregivers } from "@/app/(main)/patients/actions"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface PatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: PatientWithDetails | null
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

interface CaregiversSectionProps {
  patientId: string
}

function CaregiversSection({ patientId }: CaregiversSectionProps) {
  const [data, setData] = useState<{
    caregivers: { id: string; name: string; email: string }[]
    loading: boolean
  }>({ caregivers: [], loading: true })

  if (data.loading) {
    getPatientCaregivers(patientId).then((caregivers) => {
      setData({ caregivers, loading: false })
    })
  }

  if (data.loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (data.caregivers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum cuidador vinculado.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {data.caregivers.map((cg) => (
        <div
          key={cg.id}
          className="flex items-center justify-between rounded-md border px-3 py-2"
        >
          <div>
            <p className="font-medium">{cg.name}</p>
            <p className="text-xs text-muted-foreground">{cg.email}</p>
          </div>
          <Badge variant="outline">Cuidador</Badge>
        </div>
      ))}
    </div>
  )
}

export function PatientDialog({
  open,
  onOpenChange,
  patient,
}: PatientDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Clínica</p>
              <p className="font-medium">{patient.clinic_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Idade</p>
              <p className="font-medium">
                {calculateAge(patient.birth_date)} anos
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Nascimento</p>
              <p className="font-medium">
                {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Criado em</p>
              <p className="font-medium">
                {new Date(patient.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Cuidadores vinculados
            </p>
            <CaregiversSection patientId={patient.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
