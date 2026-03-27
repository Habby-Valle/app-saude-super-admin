"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  createShift,
  getCaregiversByPatient,
} from "@/app/(main)/(clinic-admin)/admin/shifts/actions"
import type { SelectOption } from "@/app/(main)/(clinic-admin)/admin/shifts/actions"

interface ShiftDialogProps {
  patients: SelectOption[]
}

export function ShiftDialog({ patients }: ShiftDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [caregiverId, setCaregiverId] = useState("")
  const [caregivers, setCaregivers] = useState<SelectOption[]>([])
  const [loadingCaregivers, setLoadingCaregivers] = useState(false)
  const [startedAt, setStartedAt] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    return now.toISOString().slice(0, 16)
  })
  const [errors, setErrors] = useState<{
    patient_id?: string
    caregiver_id?: string
    started_at?: string
  }>({})

  async function handlePatientChange(id: string) {
    setPatientId(id)
    setCaregiverId("")
    setCaregivers([])
    setErrors((prev) => ({ ...prev, patient_id: undefined, caregiver_id: undefined }))

    setLoadingCaregivers(true)
    const result = await getCaregiversByPatient(id)
    setCaregivers(result)
    setLoadingCaregivers(false)
  }

  function resetForm() {
    setPatientId("")
    setCaregiverId("")
    setCaregivers([])
    const now = new Date()
    now.setSeconds(0, 0)
    setStartedAt(now.toISOString().slice(0, 16))
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!patientId) newErrors.patient_id = "Selecione um paciente"
    if (!caregiverId) newErrors.caregiver_id = "Selecione um cuidador"
    if (!startedAt) newErrors.started_at = "Data de início obrigatória"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    const result = await createShift({
      patient_id: patientId,
      caregiver_id: caregiverId,
      started_at: new Date(startedAt).toISOString(),
    })

    if (result.success) {
      toast.success("Turno iniciado com sucesso!")
      setIsOpen(false)
      resetForm()
      window.location.reload()
    } else {
      toast.error(result.error ?? "Erro ao criar turno")
    }

    setIsLoading(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Turno
        </Button>
      </DialogTrigger>
      <DialogContent className="clinic-admin sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Turno</DialogTitle>
          <DialogDescription>
            Registre um novo turno de cuidados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <Select value={patientId} onValueChange={handlePatientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    Nenhum paciente cadastrado
                  </SelectItem>
                ) : (
                  patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.patient_id && (
              <p className="text-xs text-destructive">{errors.patient_id}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Cuidador *</Label>
            <Select
              value={caregiverId}
              onValueChange={setCaregiverId}
              disabled={!patientId || loadingCaregivers}
            >
              <SelectTrigger>
                {loadingCaregivers ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  <SelectValue
                    placeholder={
                      !patientId
                        ? "Selecione um paciente primeiro"
                        : "Selecione o cuidador"
                    }
                  />
                )}
              </SelectTrigger>
              <SelectContent>
                {caregivers.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    {patientId
                      ? "Nenhum cuidador vinculado a este paciente"
                      : "Selecione um paciente primeiro"}
                  </SelectItem>
                ) : (
                  caregivers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.caregiver_id && (
              <p className="text-xs text-destructive">{errors.caregiver_id}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="started-at">Início *</Label>
            <Input
              id="started-at"
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
            />
            {errors.started_at && (
              <p className="text-xs text-destructive">{errors.started_at}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Turno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
