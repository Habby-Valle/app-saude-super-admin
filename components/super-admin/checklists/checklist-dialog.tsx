"use client"

import { useState, useTransition, useEffect } from "react"
import { ClipboardList } from "lucide-react"
import type { ChecklistWithDetails } from "@/app/(main)/(super-admin)/super-admin/checklists/actions"
import { ChecklistForm } from "./checklist-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklist?: ChecklistWithDetails
}

export function ChecklistDialog({
  open,
  onOpenChange,
  checklist,
}: ChecklistDialogProps) {
  const [isPending, startTransition] = useTransition()
  // Usar o checklist diretamente da prop, sem estado interno
  const data = checklist

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {data ? "Editar Template" : "Novo Template"}
          </DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <ChecklistForm
            checklist={data}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}