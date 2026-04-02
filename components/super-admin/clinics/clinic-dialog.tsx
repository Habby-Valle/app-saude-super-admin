'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import {
  createClinic,
  updateClinic,
  uploadClinicLogoSA,
} from '@/app/(main)/(super-admin)/super-admin/clinics/actions'
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
  clinic?: Clinic
}

export function ClinicDialog({ open, onOpenChange, clinic }: ClinicDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!clinic

  async function handleSubmit(values: ClinicFormValues, logoFile: File | null) {
    setIsLoading(true)
    try {
      let logoUrl: string | null | undefined = clinic?.logo_url

      if (logoFile) {
        // Para edição usa o ID real; para criação usa um folder temporário
        const folderId = clinic?.id ?? `temp-${crypto.randomUUID()}`
        const formData = new FormData()
        formData.append('logo', logoFile)

        const uploaded = await uploadClinicLogoSA(formData, folderId)
        if (!uploaded.success) {
          toast.error(uploaded.error ?? 'Erro ao fazer upload da logo')
          return
        }
        logoUrl = uploaded.logoUrl
      }

      const result = isEditing
        ? await updateClinic(clinic.id, values, logoUrl)
        : await createClinic(values, logoUrl)

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
          defaultLogoUrl={clinic?.logo_url}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
