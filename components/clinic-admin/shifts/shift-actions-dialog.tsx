"use client"

import { useState, useTransition } from "react"
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  finishShift,
  cancelShift,
  getShiftCheckpoints,
} from "@/app/(main)/(clinic-admin)/admin/shifts/actions"
import type {
  ShiftWithDetails,
  ShiftCheckpoint,
} from "@/app/(main)/(clinic-admin)/admin/shifts/actions"

interface ShiftActionsDialogProps {
  shift: ShiftWithDetails
}

type ConfirmAction = "finish" | "cancel" | null

export function ShiftActionsDialog({ shift }: ShiftActionsDialogProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isPending, startTransition] = useTransition()
  const [checkpoints, setCheckpoints] = useState<ShiftCheckpoint[]>([])
  const [showCheckpoints, setShowCheckpoints] = useState(false)
  const [pendingChecklists, setPendingChecklists] = useState<
    { id: string; name: string }[]
  >([])
  const [justifications, setJustifications] = useState<Record<string, string>>(
    {}
  )

  if (shift.status !== "in_progress") {
    return null
  }

  function handleConfirm() {
    startTransition(async () => {
      const justificationsList = Object.entries(justifications)
        .filter(([, value]) => value.trim())
        .map(([checklistId, justification]) => ({
          checklist_id: checklistId,
          justification,
        }))

      const result =
        confirmAction === "finish"
          ? await finishShift(shift.id, justificationsList)
          : await cancelShift(shift.id)

      if (result.success) {
        toast.success(
          confirmAction === "finish"
            ? "Turno finalizado com sucesso!"
            : "Turno cancelado com sucesso!"
        )
        setConfirmAction(null)
        setJustifications({})
        window.location.reload()
      } else if (result.hasPendingChecklists && result.pendingChecklists) {
        setPendingChecklists(result.pendingChecklists)
      } else {
        toast.error(result.error ?? "Erro ao atualizar turno")
        setConfirmAction(null)
      }
    })
  }

  async function handleViewCheckpoints() {
    setShowCheckpoints(true)
    const cps = await getShiftCheckpoints(shift.id)
    setCheckpoints(cps)
  }

  function resetState() {
    setConfirmAction(null)
    setJustifications({})
    setPendingChecklists([])
    setShowCheckpoints(false)
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
          <DropdownMenuItem onClick={handleViewCheckpoints}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Ver checkpoints
          </DropdownMenuItem>
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

      {/* Dialog de Checkpoints */}
      <AlertDialog
        open={showCheckpoints}
        onOpenChange={(open) => !open && setShowCheckpoints(false)}
      >
        <AlertDialogContent className="clinic-admin max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Checkpoints do Turno</AlertDialogTitle>
            <AlertDialogDescription>
              Histórico de check-ins do cuidador. Recomendado a cada 2h.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto py-2">
            {checkpoints.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum checkpoint registrado ainda.
              </p>
            ) : (
              checkpoints.map((cp) => (
                <div key={cp.id} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">{cp.caregiver_name}</p>
                    <p className="text-muted-foreground">
                      {new Date(cp.checked_at).toLocaleString("pt-BR")}
                    </p>
                    {cp.notes && (
                      <p className="mt-1 text-muted-foreground">{cp.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowCheckpoints(false)}>
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação */}
      <AlertDialog
        open={confirmAction !== null && pendingChecklists.length === 0}
        onOpenChange={(open) => !open && resetState()}
      >
        <AlertDialogContent className="clinic-admin">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "finish"
                ? "Finalizar turno?"
                : "Cancelar turno?"}
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
                  ? "text-destructive-foreground bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmAction === "finish" ? "Finalizar" : "Cancelar turno"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Justificativas */}
      <AlertDialog
        open={pendingChecklists.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setPendingChecklists([])
            setJustifications({})
          }
        }}
      >
        <AlertDialogContent className="clinic-admin max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Checklists Pendentes
            </AlertDialogTitle>
            <AlertDialogDescription>
              O turno possui checklists que não foram preenchidos. Forneça uma
              justificativa para cada um.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 space-y-4 overflow-y-auto py-2">
            {pendingChecklists.map((cl) => (
              <div key={cl.id} className="space-y-1.5">
                <Label className="font-medium">{cl.name}</Label>
                <Textarea
                  placeholder={`Justificativa para ${cl.name}...`}
                  value={justifications[cl.id] || ""}
                  onChange={(e) =>
                    setJustifications((prev) => ({
                      ...prev,
                      [cl.id]: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Salvando..." : "Finalizar com Justificativa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
