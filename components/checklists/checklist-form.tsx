"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { useTransition } from "react"
import {
  createChecklist,
  updateChecklist,
} from "@/app/(main)/(super-admin)/checklists/actions"
import { getClinicsForChecklist } from "@/app/(main)/(super-admin)/checklists/actions"
import type {
  ChecklistWithDetails,
  ChecklistItemWithOptions,
} from "@/app/(main)/(super-admin)/checklists/actions"
import type {
  ChecklistFormValues,
  ChecklistItemFormValues,
} from "@/lib/validations/checklist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ChecklistFormProps {
  checklist?: ChecklistWithDetails
  onSuccess: () => void
}

interface ItemFormState {
  id?: string
  name: string
  type: "text" | "boolean" | "select" | "number"
  required: boolean
  has_observation: boolean
  options: { id?: string; label: string; value: string }[]
}

function createEmptyItem(): ItemFormState {
  return {
    name: "",
    type: "text",
    required: false,
    has_observation: false,
    options: [],
  }
}

export function ChecklistForm({ checklist, onSuccess }: ChecklistFormProps) {
  const [isPending, startTransition] = useTransition()
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([])
  const [shouldLoadClinics, setShouldLoadClinics] = useState(true)

  useEffect(() => {
    if (shouldLoadClinics && clinics.length === 0) {
      startTransition(() => {
        getClinicsForChecklist()
          .then((data) => {
            setClinics(data)
            setShouldLoadClinics(false)
          })
          .catch(console.error)
      })
    }
  }, [shouldLoadClinics, clinics.length])

  const [name, setName] = useState(checklist?.name ?? "")
  const [icon, setIcon] = useState(checklist?.icon ?? "")
  const [clinicId, setClinicId] = useState<string>(
    checklist?.clinic_id ?? "global"
  )
  const [items, setItems] = useState<ItemFormState[]>(() => {
    if (checklist?.checklist_items) {
      return (
        checklist.checklist_items as unknown as ChecklistItemWithOptions[]
      ).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type as ItemFormState["type"],
        required: item.required,
        has_observation: item.has_observation,
        options:
          item.checklist_item_options?.map((opt) => ({
            id: opt.id,
            label: opt.label,
            value: opt.value,
          })) ?? [],
      }))
    }
    return [createEmptyItem()]
  })

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<ItemFormState>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  const addOption = (itemIndex: number) => {
    const item = items[itemIndex]
    if (item.type !== "select") return
    updateItem(itemIndex, {
      options: [...item.options, { label: "", value: "" }],
    })
  }

  const removeOption = (itemIndex: number, optIndex: number) => {
    const item = items[itemIndex]
    updateItem(itemIndex, {
      options: item.options.filter((_, i) => i !== optIndex),
    })
  }

  const updateOption = (
    itemIndex: number,
    optIndex: number,
    updates: { label?: string; value?: string }
  ) => {
    const item = items[itemIndex]
    updateItem(itemIndex, {
      options: item.options.map((opt, i) =>
        i === optIndex ? { ...opt, ...updates } : opt
      ),
    })
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    if (items.length === 0 || items.every((i) => !i.name.trim())) {
      toast.error("Adicione pelo menos 1 item")
      return
    }

    const validItems: ChecklistItemFormValues[] = items
      .filter((i) => i.name.trim())
      .map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        required: i.required,
        has_observation: i.has_observation,
        options:
          i.type === "select" && i.options.length > 0
            ? i.options.filter((o) => o.label.trim() && o.value.trim())
            : undefined,
      }))

    if (validItems.length === 0) {
      toast.error("Adicione pelo menos 1 item com nome")
      return
    }

    const formData: ChecklistFormValues = {
      name: name.trim(),
      icon: icon.trim() || undefined,
      clinic_id: clinicId === "global" ? null : clinicId,
      items: validItems,
    }

    startTransition(async () => {
      const result = checklist?.id
        ? await updateChecklist(checklist.id, formData)
        : await createChecklist(formData)

      if (result.success) {
        toast.success(
          checklist?.id ? "Template atualizado!" : "Template criado!"
        )
        onSuccess()
      } else {
        toast.error(result.error ?? "Erro ao salvar")
      }
    })
  }

  const ITEM_TYPES = [
    { value: "text", label: "Texto" },
    { value: "boolean", label: "Sim/Não" },
    { value: "select", label: "Seleção" },
    { value: "number", label: "Número" },
  ] as const

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome do template *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Checklist Matinal"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="icon">Ícone (emoji)</Label>
          <Input
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Ex: ☀️"
            maxLength={2}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scope">Escopo</Label>
        <Select value={clinicId} onValueChange={setClinicId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global (todas as clínicas)</SelectItem>
            {clinics.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Itens do checklist</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg border p-3"
            >
              <div className="mt-2 cursor-move text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-2">
                  <Input
                    className="flex-1"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(index, { name: e.target.value })
                    }
                    placeholder={`Item ${index + 1}`}
                  />
                  <Select
                    value={item.type}
                    onValueChange={(v) =>
                      updateItem(index, {
                        type: v as ItemFormState["type"],
                        options:
                          v === "select" ? [{ label: "", value: "" }] : [],
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={item.required}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        updateItem(index, { required: checked === true })
                      }
                    />
                    <Label
                      htmlFor={`required-${index}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      Obrigatório
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`obs-${index}`}
                      checked={item.has_observation}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        updateItem(index, { has_observation: checked === true })
                      }
                    />
                    <Label
                      htmlFor={`obs-${index}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      Permite observação
                    </Label>
                  </div>
                </div>

                {item.type === "select" && (
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Opções de seleção
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(index)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Opção
                      </Button>
                    </div>
                    {item.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <Input
                          className="flex-1"
                          value={opt.label}
                          onChange={(e) =>
                            updateOption(index, optIndex, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Label"
                        />
                        <Input
                          className="flex-1"
                          value={opt.value}
                          onChange={(e) =>
                            updateOption(index, optIndex, {
                              value: e.target.value,
                            })
                          }
                          placeholder="Valor"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index, optIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {item.options.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Clique em &ldquo;Opção&rdquo; para adicionar opções de
                        seleção.
                      </p>
                    )}
                  </div>
                )}

                {item.type === "boolean" && (
                  <Badge variant="outline" className="text-xs">
                    ☑️/☐
                  </Badge>
                )}
                {item.type === "number" && (
                  <Badge variant="outline" className="text-xs">
                    123
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending
            ? "Salvando..."
            : checklist?.id
              ? "Salvar"
              : "Criar template"}
        </Button>
      </div>
    </div>
  )
}
