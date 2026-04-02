"use client"

import { useState } from "react"
import { Edit, Loader2, PowerOff, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  updateCaregiver,
  toggleCaregiverStatus,
  type ClinicCaregiver,
} from "@/app/(main)/(clinic-admin)/admin/caregivers/actions"

interface CaregiverEditDialogProps {
  caregiver: ClinicCaregiver
}

export function CaregiverEditDialog({ caregiver }: CaregiverEditDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(caregiver.name)
  const [errors, setErrors] = useState<{ name?: string }>({})

  const isBlocked = caregiver.status === "blocked"

  function handleOpenChange(open: boolean) {
    if (open) {
      setName(caregiver.name)
      setErrors({})
    }
    setIsOpen(open)
  }

  function validate(): boolean {
    const newErrors: { name?: string } = {}
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Nome precisa ter pelo menos 2 caracteres"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const result = await updateCaregiver(caregiver.id, { name: name.trim() })
    if (result.success) {
      toast.success("Cuidador atualizado com sucesso!")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error ?? "Erro ao atualizar cuidador")
    }
    setIsLoading(false)
  }

  async function handleToggleStatus() {
    const newStatus = isBlocked ? "active" : "blocked"
    const result = await toggleCaregiverStatus(caregiver.id, newStatus)
    if (result.success) {
      toast.success(isBlocked ? "Cuidador reativado!" : "Cuidador desativado!")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error ?? "Erro ao alterar status")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="clinic-admin sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle>Editar Cuidador</DialogTitle>
          <DialogDescription>Atualize os dados do cuidador.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`edit-name-${caregiver.id}`}>Nome completo *</Label>
            <Input
              id={`edit-name-${caregiver.id}`}
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={caregiver.email} disabled />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado.
            </p>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            {/* Desativar / Reativar (sem exclusão permanente) */}
            {isBlocked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reativar
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <PowerOff className="mr-2 h-4 w-4" />
                    Desativar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desativar cuidador?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O cuidador <strong>{caregiver.name}</strong> perderá
                      acesso ao sistema. Os dados serão preservados e ele poderá
                      ser reativado a qualquer momento.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleStatus}>
                      Desativar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
