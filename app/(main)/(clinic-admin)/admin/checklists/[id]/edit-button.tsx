"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClinicChecklistDialog } from "@/components/clinic-admin/checklists/checklist-dialog"
import type { ClinicChecklistWithDetails } from "@/app/(main)/(clinic-admin)/admin/checklists/actions"

interface ChecklistEditButtonProps {
  checklist: ClinicChecklistWithDetails
}

export function ChecklistEditButton({ checklist }: ChecklistEditButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Editar
      </Button>
      <ClinicChecklistDialog
        open={open}
        onOpenChange={setOpen}
        checklist={checklist}
      />
    </>
  )
}
