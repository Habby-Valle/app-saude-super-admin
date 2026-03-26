"use client"

import { useState } from "react"
import { Edit, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  deleteCaregiver,
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

    const result = await updateCaregiver(caregiver.id, {
      name: name.trim(),
    })

    if (result.success) {
      toast.success("Cuidador atualizado com sucesso!")
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error ?? "Erro ao atualizar cuidador")
    }

    setIsLoading(false)
  }

  async function handleDelete() {
    const result = await deleteCaregiver(caregiver.id)

    if (result.success) {
      toast.success("Cuidador excluído com sucesso!")
      router.refresh()
    } else {
      toast.error(result.error ?? "Erro ao excluir cuidador")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="clinic-admin sm:max-w-[450px]">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir cuidador</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este cuidador? Esta ação não
                    pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
