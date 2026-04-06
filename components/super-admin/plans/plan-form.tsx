"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, X } from "lucide-react"

import { planSchema, type PlanFormValues } from "@/lib/validations/plan"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PlanFormProps {
  defaultValues?: Partial<PlanFormValues>
  onSubmit: (values: PlanFormValues) => Promise<void>
  isLoading?: boolean
}

export function PlanForm({
  defaultValues,
  onSubmit,
  isLoading,
}: PlanFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      billing_cycle: "monthly",
      is_active: true,
      features: [],
      max_users: 5,
      max_patients: 20,
      max_storage: 10,
      sort_order: 0,
      ...defaultValues,
    },
  })

  const billingCycle = watch("billing_cycle")
  const features = watch("features") ?? []
  const [newFeature, setNewFeature] = useState("")

  function addFeature() {
    const trimmed = newFeature.trim()
    if (trimmed && !features.includes(trimmed)) {
      setValue("features", [...features, trimmed], { shouldValidate: true })
      setNewFeature("")
    }
  }

  function removeFeature(index: number) {
    setValue(
      "features",
      features.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }

  async function handleFormSubmit(values: PlanFormValues) {
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome do plano *</Label>
          <Input
            id="name"
            placeholder="Ex: Plano Profissional"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="billing_cycle">Ciclo de cobrança *</Label>
          <Select
            value={billingCycle}
            onValueChange={(v) =>
              setValue("billing_cycle", v as PlanFormValues["billing_cycle"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ciclo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
            </SelectContent>
          </Select>
          {errors.billing_cycle && (
            <p className="text-xs text-destructive">
              {errors.billing_cycle.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          placeholder="Descreva os benefícios e diferenciais do plano..."
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={watch("price") ?? ""}
            onChange={(e) =>
              setValue("price", parseFloat(e.target.value) || 0, {
                shouldValidate: true,
              })
            }
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="max_users">Máx. usuários *</Label>
          <Input
            id="max_users"
            type="number"
            min="1"
            placeholder="5"
            value={watch("max_users") ?? ""}
            onChange={(e) =>
              setValue("max_users", parseInt(e.target.value) || 1, {
                shouldValidate: true,
              })
            }
          />
          {errors.max_users && (
            <p className="text-xs text-destructive">
              {errors.max_users.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="max_patients">Máx. pacientes *</Label>
          <Input
            id="max_patients"
            type="number"
            min="1"
            placeholder="20"
            value={watch("max_patients") ?? ""}
            onChange={(e) =>
              setValue("max_patients", parseInt(e.target.value) || 1, {
                shouldValidate: true,
              })
            }
          />
          {errors.max_patients && (
            <p className="text-xs text-destructive">
              {errors.max_patients.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="max_storage">Armazenamento (GB) *</Label>
        <Input
          id="max_storage"
          type="number"
          min="0"
          placeholder="10"
          value={watch("max_storage") ?? ""}
          onChange={(e) =>
            setValue("max_storage", parseInt(e.target.value) || 0, {
              shouldValidate: true,
            })
          }
        />
        {errors.max_storage && (
          <p className="text-xs text-destructive">
            {errors.max_storage.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Recursos do plano</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar recurso..."
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addFeature()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={watch("is_active")}
          onCheckedChange={(checked) => setValue("is_active", checked)}
        />
        <Label htmlFor="is_active">Plano ativo</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar plano
      </Button>
    </form>
  )
}
