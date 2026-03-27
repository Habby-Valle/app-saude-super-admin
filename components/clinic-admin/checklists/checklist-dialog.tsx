"use client"

import { ClipboardList } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClinicChecklistForm } from "./checklist-form"
import type { ClinicChecklistWithDetails } from "@/app/(main)/(clinic-admin)/admin/checklists/actions"

interface ClinicChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklist?: ClinicChecklistWithDetails
}

export function ClinicChecklistDialog({
  open,
  onOpenChange,
  checklist,
}: ClinicChecklistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="clinic-admin max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {checklist ? "Editar Checklist" : "Novo Checklist"}
          </DialogTitle>
        </DialogHeader>
        <ClinicChecklistForm
          checklist={checklist}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
