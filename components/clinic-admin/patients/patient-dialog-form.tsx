"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  createPatient,
  getClinicCaregivers,
  type PatientCaregiver,
} from "@/app/(main)/(clinic-admin)/admin/patients/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface PatientDialogFormProps {
  onSuccess?: () => void
}

export function PatientDialogForm({ onSuccess }: PatientDialogFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(true)
  const [caregivers, setCaregivers] = useState<PatientCaregiver[]>([])

  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [selectedCaregivers, setSelectedCaregivers] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; birth_date?: string }>(
    {}
  )

  useEffect(() => {
    async function loadCaregivers() {
      const data = await getClinicCaregivers()
      setCaregivers(data)
      setIsLoadingCaregivers(false)
    }
    loadCaregivers()
  }, [])

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

    const result = await createPatient({
      name: name.trim(),
      birth_date: birthDate,
      caregiver_ids: selectedCaregivers,
    })

    if (result.success) {
      toast.success("Paciente criado com sucesso!")
      setName("")
      setBirthDate("")
      setSelectedCaregivers([])
      setErrors({})
      onSuccess?.()
      router.refresh()
    } else {
      toast.error(result.error ?? "Erro ao criar paciente")
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
        <Label htmlFor="name">Nome completo *</Label>
        <Input
          id="name"
          placeholder="Maria da Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birth_date">Data de nascimento *</Label>
        <Input
          id="birth_date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        {errors.birth_date && (
          <p className="text-xs text-destructive">{errors.birth_date}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Cuidadores</Label>
        {isLoadingCaregivers ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando cuidadores...
          </div>
        ) : caregivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum cuidador cadastrado na clínica.
          </p>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
            {caregivers.map((caregiver) => (
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
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setName("")
            setBirthDate("")
            setSelectedCaregivers([])
            setErrors({})
          }}
        >
          Limpar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Paciente
        </Button>
      </div>
    </form>
  )
}
