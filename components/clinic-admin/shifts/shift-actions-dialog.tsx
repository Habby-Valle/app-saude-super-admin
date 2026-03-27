"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"
import {
  finishShift,
  cancelShift,
} from "@/app/(main)/(clinic-admin)/admin/shifts/actions"
import type { ShiftWithDetails } from "@/app/(main)/(clinic-admin)/admin/shifts/actions"

interface ShiftActionsDialogProps {
  shift: ShiftWithDetails
}

type ConfirmAction = "finish" | "cancel" | null

export function ShiftActionsDialog({ shift }: ShiftActionsDialogProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isPending, startTransition] = useTransition()

  if (shift.status !== "in_progress") {
    return null
  }

  function handleConfirm() {
    startTransition(async () => {
      const result =
        confirmAction === "finish"
          ? await finishShift(shift.id)
          : await cancelShift(shift.id)

      if (result.success) {
        toast.success(
          confirmAction === "finish"
            ? "Turno finalizado com sucesso!"
            : "Turno cancelado com sucesso!"
        )
        setConfirmAction(null)
        window.location.reload()
      } else {
        toast.error(result.error ?? "Erro ao atualizar turno")
        setConfirmAction(null)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setConfirmAction("finish")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Finalizar turno
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setConfirmAction("cancel")}
            className="text-destructive focus:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancelar turno
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent className="clinic-admin">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "finish" ? "Finalizar turno?" : "Cancelar turno?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "finish"
                ? `Deseja finalizar o turno de ${shift.caregiver_name} para ${shift.patient_name}?`
                : `Deseja cancelar o turno de ${shift.caregiver_name} para ${shift.patient_name}? Esta ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={
                confirmAction === "cancel"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmAction === "finish" ? "Finalizar" : "Cancelar turno"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
