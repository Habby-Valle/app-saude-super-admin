"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { finishShift, cancelShift } from "../actions"
import { Button } from "@/components/ui/button"
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

interface ShiftActionsProps {
  shiftId: string
}

export function ShiftActions({ shiftId }: ShiftActionsProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFinish = async () => {
    setIsLoading(true)
    const result = await finishShift(shiftId)
    setIsLoading(false)
    setFinishOpen(false)

    if (result.success) {
      toast.success("Turno finalizado com sucesso.")
      router.refresh()
    } else if (result.hasPendingChecklists) {
      toast.error(
        "Existem checklists pendentes. Finalize-os antes de encerrar o turno."
      )
    } else {
      toast.error(result.error ?? "Erro ao finalizar turno.")
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    const result = await cancelShift(shiftId)
    setIsLoading(false)
    setCancelOpen(false)

    if (result.success) {
      toast.success("Turno cancelado.")
      router.refresh()
    } else {
      toast.error(result.error ?? "Erro ao cancelar turno.")
    }
  }

  return (
    <div className="flex gap-2">
      <AlertDialog open={finishOpen} onOpenChange={setFinishOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Finalizar Turno
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma que deseja finalizar este turno? Se houver checklists
              pendentes, será necessário finalizá-los primeiro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinish}
              disabled={isLoading}
            >
              {isLoading ? "Finalizando..." : "Sim, finalizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <XCircle className="mr-1.5 h-4 w-4" />
            Cancelar Turno
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancelar turno?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O turno será marcado como
              cancelado e o horário de fim será registrado como agora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Manter turno
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Cancelando..." : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
