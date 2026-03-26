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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCaregiver } from "@/app/(main)/(clinic-admin)/admin/caregivers/actions"

export function CaregiverDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  function handleSuccess() {
    setIsOpen(false)
    setName("")
    setEmail("")
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: { name?: string; email?: string } = {}

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Nome precisa ter pelo menos 2 caracteres"
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    const result = await createCaregiver({
      name: name.trim(),
      email: email.trim(),
    })

    if (result.success) {
      toast.success("Cuidador criado com sucesso!")
      handleSuccess()
      window.location.reload()
    } else {
      toast.error(result.error ?? "Erro ao criar cuidador")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cuidador
        </Button>
      </DialogTrigger>
      <DialogContent className="clinic-admin sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Novo Cuidador</DialogTitle>
          <DialogDescription>
            Cadastre um novo cuidador na clínica. Uma senha temporária será
            enviada por email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="caregiver-name">Nome completo *</Label>
            <Input
              id="caregiver-name"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="caregiver-email">Email *</Label>
            <Input
              id="caregiver-email"
              type="email"
              placeholder="joao@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setName("")
                setEmail("")
                setErrors({})
              }}
            >
              Limpar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cuidador
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
