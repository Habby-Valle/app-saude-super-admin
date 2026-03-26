"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  updatePatient,
  updatePatientCaregivers,
  getClinicCaregivers,
  getPatientCaregivers,
  type PatientCaregiver,
} from "@/app/(main)/(clinic-admin)/admin/patients/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface PatientEditDialogFormProps {
  patientId: string
  initialName: string
  initialBirthDate: string
  onSuccess?: () => void
}

export function PatientEditDialogForm({
  patientId,
  initialName,
  initialBirthDate,
  onSuccess,
}: PatientEditDialogFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(true)
  const [allCaregivers, setAllCaregivers] = useState<PatientCaregiver[]>([])
  const [patientCaregivers, setPatientCaregivers] = useState<
    PatientCaregiver[]
  >([])

  const [name, setName] = useState(initialName)
  const [birthDate, setBirthDate] = useState(initialBirthDate)
  const [selectedCaregivers, setSelectedCaregivers] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; birth_date?: string }>(
    {}
  )

  useEffect(() => {
    async function loadCaregivers() {
      const [all, current] = await Promise.all([
        getClinicCaregivers(),
        getPatientCaregivers(patientId),
      ])
      setAllCaregivers(all)
      setPatientCaregivers(current)
      setSelectedCaregivers(current.map((c) => c.id))
      setIsLoadingCaregivers(false)
    }
    loadCaregivers()
  }, [patientId])

  function validate(): boolean {
    const newErrors: { name?: string; birth_date?: string } = {}

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Nome precisa ter pelo menos 2 caracteres"
    }

    if (!birthDate) {
      newErrors.birth_date = "Data de nascimento é obrigatória"
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      newErrors.birth_date = "Data de nascimento inválida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    const result = await updatePatient(patientId, {
      name: name.trim(),
      birth_date: birthDate,
    })

    if (result.success) {
      const caregiversResult = await updatePatientCaregivers(
        patientId,
        selectedCaregivers
      )

      if (caregiversResult.success) {
        toast.success("Paciente atualizado com sucesso!")
        onSuccess?.()
        router.refresh()
      } else {
        toast.error(caregiversResult.error ?? "Erro ao atualizar cuidadores")
      }
    } else {
      toast.error(result.error ?? "Erro ao atualizar paciente")
    }

    setIsLoading(false)
  }

  function toggleCaregiver(caregiverId: string) {
    setSelectedCaregivers((prev) =>
      prev.includes(caregiverId)
        ? prev.filter((id) => id !== caregiverId)
        : [...prev, caregiverId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Nome completo *</Label>
        <Input
          id="edit-name"
          placeholder="Maria da Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-birth_date">Data de nascimento *</Label>
        <Input
          id="edit-birth_date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        {errors.birth_date && (
          <p className="text-xs text-destructive">{errors.birth_date}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Cuidadores vinculados</Label>
        {isLoadingCaregivers ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando cuidadores...
          </div>
        ) : allCaregivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum cuidador cadastrado na clínica.
          </p>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
            {allCaregivers.map((caregiver) => (
              <label
                key={caregiver.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
              >
                <Checkbox
                  checked={selectedCaregivers.includes(caregiver.id)}
                  onCheckedChange={() => toggleCaregiver(caregiver.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{caregiver.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {caregiver.email}
                  </p>
                </div>
                {patientCaregivers.some((c) => c.id === caregiver.id) && (
                  <span className="text-xs text-primary">Atual</span>
                )}
              </label>
            ))}
          </div>
        )}
        {selectedCaregivers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedCaregivers.length} cuidador(es) selecionado(s)
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}
