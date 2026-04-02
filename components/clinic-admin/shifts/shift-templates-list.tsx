"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Clock, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
  getShiftTemplates,
} from "@/app/(main)/(clinic-admin)/admin/shifts/actions"
import type { ShiftTemplate } from "@/app/(main)/(clinic-admin)/admin/shifts/actions"

interface ShiftTemplatesListProps {
  templates: ShiftTemplate[]
}

interface FormData {
  name: string
  start_time: string
  end_time: string
  instructions: string
}

export function ShiftTemplatesList({
  templates: initialTemplates,
}: ShiftTemplatesListProps) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    start_time: "07:00",
    end_time: "19:00",
    instructions: "",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  function resetForm() {
    setFormData({
      name: "",
      start_time: "07:00",
      end_time: "19:00",
      instructions: "",
    })
    setErrors({})
    setEditingTemplate(null)
  }

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!formData.start_time)
      newErrors.start_time = "Horário de início obrigatório"
    if (!formData.end_time) newErrors.end_time = "Horário de fim obrigatório"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    let result
    if (editingTemplate) {
      result = await updateShiftTemplate({
        id: editingTemplate.id,
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        instructions: formData.instructions || undefined,
        is_active: editingTemplate.is_active,
      })
    } else {
      result = await createShiftTemplate({
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        instructions: formData.instructions || undefined,
      })
    }

    if (result.success) {
      toast.success(
        editingTemplate ? "Template atualizado!" : "Template criado!"
      )
      const updated = await getShiftTemplates()
      setTemplates(updated)
      setIsOpen(false)
      resetForm()
    } else {
      toast.error(result.error ?? "Erro ao salvar")
    }

    setIsLoading(false)
  }

  async function handleToggleActive(template: ShiftTemplate) {
    const result = await updateShiftTemplate({
      id: template.id,
      name: template.name,
      start_time: template.start_time,
      end_time: template.end_time,
      instructions: template.instructions ?? undefined,
      is_active: !template.is_active,
    })

    if (result.success) {
      toast.success(
        !template.is_active ? "Template ativado" : "Template desativado"
      )
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id ? { ...t, is_active: !t.is_active } : t
        )
      )
    } else {
      toast.error(result.error ?? "Erro ao atualizar")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este template?")) return

    const result = await deleteShiftTemplate(id)
    if (result.success) {
      toast.success("Template excluído")
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } else {
      toast.error(result.error ?? "Erro ao excluir")
    }
  }

  function openEdit(template: ShiftTemplate) {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      start_time: template.start_time,
      end_time: template.end_time,
      instructions: template.instructions ?? "",
    })
    setIsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="clinic-admin sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </DialogTitle>
              <DialogDescription>
                Configure os horários e instruções padrão para este template.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Turno Manhã"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start_time">Início *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                  {errors.start_time && (
                    <p className="text-xs text-destructive">
                      {errors.start_time}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end_time">Fim *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                  {errors.end_time && (
                    <p className="text-xs text-destructive">
                      {errors.end_time}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructions">Instruções</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instruções padrão para este turno..."
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  rows={3}
                />
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
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTemplate ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Instruções</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                Nenhum template cadastrado. Crie um para facilitar a criação de
                turnos.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {template.start_time} - {template.end_time}
                  </div>
                </TableCell>
                <TableCell>
                  {template.instructions ? (
                    <div className="flex max-w-[200px] items-center gap-2 truncate">
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate text-muted-foreground">
                        {template.instructions}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={() => handleToggleActive(template)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
