"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PatientDialogForm } from "./patient-dialog-form"

export function PatientDialog() {
  const [isOpen, setIsOpen] = useState(false)

  function handleSuccess() {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="clinic-admin sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
          <DialogDescription>
            Cadastre um novo paciente na clínica.
          </DialogDescription>
        </DialogHeader>
        <PatientDialogForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
