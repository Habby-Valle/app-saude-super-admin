"use client"

import { useState } from "react"
import { Edit } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PatientEditDialogForm } from "./patient-edit-dialog-form"

interface PatientEditDialogProps {
  patientId: string
  patientName: string
  patientBirthDate: string
}

export function PatientEditDialog({
  patientId,
  patientName,
  patientBirthDate,
}: PatientEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSuccess() {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="clinic-admin sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>Atualize os dados do paciente.</DialogDescription>
        </DialogHeader>
        <PatientEditDialogForm
          patientId={patientId}
          initialName={patientName}
          initialBirthDate={patientBirthDate}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
