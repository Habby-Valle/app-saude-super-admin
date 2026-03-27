"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
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
  acknowledgeClinicSosAlert,
  resolveClinicSosAlert,
} from "@/app/(main)/(clinic-admin)/admin/sos/actions"
import type { ClinicSosAlertWithDetails } from "@/app/(main)/(clinic-admin)/admin/sos/actions"

interface ClinicSosAcknowledgeDialogProps {
  alert: ClinicSosAlertWithDetails | null
  onOpenChange: (open: boolean) => void
}

export function ClinicSosAcknowledgeDialog({
  alert,
  onOpenChange,
}: ClinicSosAcknowledgeDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    if (!alert) return
    startTransition(async () => {
      const result = await acknowledgeClinicSosAlert(alert.id)
      if (result.success) {
        toast.success("Alerta confirmado.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao confirmar alerta.")
      }
      onOpenChange(false)
    })
  }

  return (
    <AlertDialog
      open={!!alert}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false)
      }}
    >
      <AlertDialogContent className="clinic-admin">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar alerta SOS?</AlertDialogTitle>
          <AlertDialogDescription>
            Você está ciente do alerta de{" "}
            <strong>{alert?.patient_name ?? "paciente desconhecido"}</strong> e está
            tomando as providências necessárias.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={isPending}>
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface ClinicSosResolveDialogProps {
  alert: ClinicSosAlertWithDetails | null
  onOpenChange: (open: boolean) => void
}

export function ClinicSosResolveDialog({
  alert,
  onOpenChange,
}: ClinicSosResolveDialogProps) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleResolve = () => {
    if (!alert) return
    startTransition(async () => {
      const result = await resolveClinicSosAlert(alert.id, notes || undefined)
      if (result.success) {
        toast.success("Alerta resolvido.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao resolver alerta.")
      }
      onOpenChange(false)
      setNotes("")
    })
  }

  return (
    <AlertDialog
      open={!!alert}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false)
          setNotes("")
        }
      }}
    >
      <AlertDialogContent className="clinic-admin">
        <AlertDialogHeader>
          <AlertDialogTitle>Resolver alerta SOS?</AlertDialogTitle>
          <AlertDialogDescription>
            Marcar o alerta de{" "}
            <strong>{alert?.patient_name ?? "paciente desconhecido"}</strong> como
            resolvido. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-1 pb-2">
          <Label htmlFor="resolve-notes-clinic" className="text-sm">
            Observações (opcional)
          </Label>
          <Textarea
            id="resolve-notes-clinic"
            className="mt-1.5"
            rows={3}
            placeholder="Descreva como o alerta foi resolvido..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button onClick={handleResolve} disabled={isPending}>
            Resolver
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
