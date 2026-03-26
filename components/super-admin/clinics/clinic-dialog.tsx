'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { createClinic, updateClinic } from '@/app/(main)/(super-admin)/super-admin/clinics/actions'
import type { ClinicFormValues } from '@/lib/validations/clinic'
import type { Clinic } from '@/types/database'
import { ClinicForm } from './clinic-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ClinicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic?: Clinic // se presente, modo edição
}

export function ClinicDialog({ open, onOpenChange, clinic }: ClinicDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!clinic

  async function handleSubmit(values: ClinicFormValues) {
    setIsLoading(true)
    try {
      const result = isEditing
        ? await updateClinic(clinic.id, values)
        : await createClinic(values)

      if (!result.success) {
        toast.error(result.error ?? 'Erro inesperado')
        return
      }

      toast.success(isEditing ? 'Clínica atualizada!' : 'Clínica criada!')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar clínica' : 'Nova clínica'}
          </DialogTitle>
        </DialogHeader>
        <ClinicForm
          defaultValues={
            clinic
              ? {
                  name: clinic.name,
                  cnpj: clinic.cnpj,
                  status: clinic.status,
                  plan: clinic.plan ?? '',
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
