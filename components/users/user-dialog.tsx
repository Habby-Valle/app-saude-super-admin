'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { inviteUser, updateUser } from '@/app/(main)/users/actions'
import type { User } from '@/types/database'
import type { Clinic } from '@/types/database'
import type { InviteUserValues, UpdateUserValues } from '@/lib/validations/user'
import { UserForm } from './user-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
  clinics: Pick<Clinic, 'id' | 'name'>[]
}

export function UserDialog({ open, onOpenChange, user, clinics }: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!user

  const handleSubmit = async (data: InviteUserValues | UpdateUserValues) => {
    setIsLoading(true)
    try {
      const result = isEditing
        ? await updateUser(user.id, data as UpdateUserValues)
        : await inviteUser(data as InviteUserValues)

      if (result.success) {
        toast.success(
          isEditing
            ? 'Usuário atualizado com sucesso.'
            : 'Convite enviado com sucesso.',
        )
        onOpenChange(false)
      } else {
        toast.error(result.error ?? 'Ocorreu um erro.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar usuário' : 'Convidar usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do usuário.'
              : 'Um email de convite será enviado para o endereço informado.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
          clinics={clinics}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
