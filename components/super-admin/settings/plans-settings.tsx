"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Check } from "lucide-react"
import {
  createPlan,
  updatePlan,
  deletePlan,
} from "@/app/(main)/(super-admin)/settings/actions"
import type { Plan } from "@/app/(main)/(super-admin)/settings/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

interface PlansSettingsProps {
  initialPlans: Plan[]
}

export function PlansSettings({ initialPlans }: PlansSettingsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [plans, setPlans] = useState(initialPlans)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [featuresInput, setFeaturesInput] = useState("")

  const openCreate = () => {
    setEditingPlan(null)
    setName("")
    setDescription("")
    setPrice("")
    setFeaturesInput("")
    setDialogOpen(true)
  }

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setName(plan.name)
    setDescription(plan.description ?? "")
    setPrice(String(plan.price))
    setFeaturesInput(plan.features.join(", "))
    setDialogOpen(true)
  }

  const handleSave = () => {
    const features = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)

    const priceNum = parseFloat(price) || 0

    startTransition(async () => {
      const result = editingPlan
        ? await updatePlan(
            editingPlan.id,
            name,
            description || null,
            priceNum,
            features,
            editingPlan.is_active
          )
        : await createPlan(name, description || null, priceNum, features)

      if (result.success) {
        toast.success(editingPlan ? "Plano atualizado!" : "Plano criado!")
        setDialogOpen(false)
        router.refresh()
        const updatedPlans = editingPlan
          ? plans.map((p) =>
              p.id === editingPlan.id
                ? { ...p, name, description, price: priceNum, features }
                : p
            )
          : [
              ...plans,
              {
                id: Date.now().toString(),
                name,
                description,
                price: priceNum,
                features,
                is_active: true,
                created_at: new Date().toISOString(),
              },
            ]
        setPlans(updatedPlans)
      } else {
        toast.error(result.error ?? "Erro ao salvar")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deletePlan(deleteTarget.id)
      if (result.success) {
        toast.success("Plano excluído!")
        setPlans(plans.filter((p) => p.id !== deleteTarget.id))
      } else {
        toast.error(result.error ?? "Erro ao excluir")
      }
      setDeleteTarget(null)
    })
  }

  const handleToggleActive = (plan: Plan) => {
    startTransition(async () => {
      const result = await updatePlan(
        plan.id,
        plan.name,
        plan.description,
        plan.price,
        plan.features,
        !plan.is_active
      )
      if (result.success) {
        setPlans(
          plans.map((p) =>
            p.id === plan.id ? { ...p, is_active: !p.is_active } : p
          )
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Planos de Assinatura</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os planos disponíveis para as clínicas.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum plano cadastrado. Clique em &ldquo;Novo Plano&rdquo; para
            começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-2xl font-bold">
                  R$ {plan.price.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </p>
                <ul className="mb-4 space-y-1">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      +{plan.features.length - 3} mais...
                    </li>
                  )}
                </ul>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(plan)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => handleToggleActive(plan)}
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
              {editingPlan ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Plano Básico"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do plano"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço (R$/mês)</Label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.90"
              />
            </div>
            <div className="space-y-2">
              <Label>Features (separadas por vírgula)</Label>
              <Input
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Até 10 usuários, Checklists ilimitados, Relatórios"
              />
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
            <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
            <AlertDialogDescription>
              O plano <strong>{deleteTarget?.name}</strong> será excluído
              permanentemente.
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
