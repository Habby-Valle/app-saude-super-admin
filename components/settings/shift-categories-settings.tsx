"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  createShiftCategory,
  updateShiftCategory,
  deleteShiftCategory,
} from "@/app/(main)/settings/actions"
import type { ShiftCategory } from "@/app/(main)/settings/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useTransition } from "react"

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

interface ShiftCategoriesSettingsProps {
  initialCategories: ShiftCategory[]
}

export function ShiftCategoriesSettings({
  initialCategories,
}: ShiftCategoriesSettingsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShiftCategory | null>(null)
  const [editingCategory, setEditingCategory] = useState<ShiftCategory | null>(
    null
  )

  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])

  const openCreate = () => {
    setEditingCategory(null)
    setName("")
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    setDialogOpen(true)
  }

  const openEdit = (category: ShiftCategory) => {
    setEditingCategory(category)
    setName(category.name)
    setColor(category.color)
    setDialogOpen(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = editingCategory
        ? await updateShiftCategory(
            editingCategory.id,
            name,
            color,
            editingCategory.is_active
          )
        : await createShiftCategory(name, color)

      if (result.success) {
        toast.success(
          editingCategory ? "Categoria atualizada!" : "Categoria criada!"
        )
        setDialogOpen(false)
        router.refresh()
        const updatedCategories = editingCategory
          ? categories.map((c) =>
              c.id === editingCategory.id ? { ...c, name, color } : c
            )
          : [
              ...categories,
              { id: Date.now().toString(), name, color, is_active: true },
            ]
        setCategories(updatedCategories)
      } else {
        toast.error(result.error ?? "Erro ao salvar")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteShiftCategory(deleteTarget.id)
      if (result.success) {
        toast.success("Categoria excluída!")
        setCategories(categories.filter((c) => c.id !== deleteTarget.id))
      } else {
        toast.error(result.error ?? "Erro ao excluir")
      }
      setDeleteTarget(null)
    })
  }

  const handleToggleActive = (category: ShiftCategory) => {
    startTransition(async () => {
      const result = await updateShiftCategory(
        category.id,
        category.name,
        category.color,
        !category.is_active
      )
      if (result.success) {
        setCategories(
          categories.map((c) =>
            c.id === category.id ? { ...c, is_active: !c.is_active } : c
          )
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Categorias de Turno</h2>
          <p className="text-sm text-muted-foreground">
            Defina as categorias disponíveis para classificar turnos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma categoria cadastrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={!category.is_active ? "opacity-60" : ""}
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: category.color }}
                  >
                    <span className="text-sm font-bold text-white">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.color}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(category)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => handleToggleActive(category)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Manhã, Tarde, Noite"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${
                      color === c ? "border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending || !name.trim()}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>{deleteTarget?.name}</strong> será excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
