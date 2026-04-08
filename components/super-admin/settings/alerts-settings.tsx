"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
import {
  createAlertThreshold,
  updateAlertThreshold,
  deleteAlertThreshold,
} from "@/app/(main)/(super-admin)/super-admin/settings/actions"
import type { AlertThreshold } from "@/types/database"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useTransition } from "react"

const METRICS = [
  { value: "shifts_per_day", label: "Turnos por dia" },
  { value: "checklists_pending", label: "Checklists pendentes" },
  { value: "patients_at_risk", label: "Pacientes em risco" },
  { value: "caregivers_offline", label: "Cuidadores offline" },
  { value: "missed_checkins", label: "Check-ins perdidos" },
]

const OPERATORS = [
  { value: "gt", label: "Maior que" },
  { value: "lt", label: "Menor que" },
  { value: "eq", label: "Igual a" },
]

interface AlertsSettingsProps {
  initialThresholds: AlertThreshold[]
}

export function AlertsSettings({ initialThresholds }: AlertsSettingsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [thresholds, setThresholds] = useState(initialThresholds)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AlertThreshold | null>(null)
  const [editingThreshold, setEditingThreshold] =
    useState<AlertThreshold | null>(null)

  const [name, setName] = useState("")
  const [metric, setMetric] = useState(METRICS[0].value)
  const [operator, setOperator] = useState<"gt" | "lt" | "eq">("gt")
  const [value, setValue] = useState("")
  const [message, setMessage] = useState("")

  const openCreate = () => {
    setEditingThreshold(null)
    setName("")
    setMetric(METRICS[0].value)
    setOperator("gt")
    setValue("")
    setMessage("")
    setDialogOpen(true)
  }

  const openEdit = (threshold: AlertThreshold) => {
    setEditingThreshold(threshold)
    setName(threshold.name)
    setMetric(threshold.metric)
    setOperator(threshold.operator)
    setValue(String(threshold.value))
    setMessage(threshold.message)
    setDialogOpen(true)
  }

  const handleSave = () => {
    const valueNum = parseFloat(value) || 0

    startTransition(async () => {
      const result = editingThreshold
        ? await updateAlertThreshold(
            editingThreshold.id,
            name,
            metric,
            operator,
            valueNum,
            message,
            editingThreshold.is_active
          )
        : await createAlertThreshold(name, metric, operator, valueNum, message)

      if (result.success) {
        toast.success(
          editingThreshold ? "Alerta atualizado!" : "Alerta criado!"
        )
        setDialogOpen(false)
        router.refresh()
        const updatedThresholds = editingThreshold
          ? thresholds.map((t) =>
              t.id === editingThreshold.id
                ? { ...t, name, metric, operator, value: valueNum, message }
                : t
            )
          : [
              ...thresholds,
              {
                id: Date.now().toString(),
                name,
                metric,
                operator,
                value: valueNum,
                message,
                is_active: true,
              },
            ]
        setThresholds(updatedThresholds)
      } else {
        toast.error(result.error ?? "Erro ao salvar")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteAlertThreshold(deleteTarget.id)
      if (result.success) {
        toast.success("Alerta excluído!")
        setThresholds(thresholds.filter((t) => t.id !== deleteTarget.id))
      } else {
        toast.error(result.error ?? "Erro ao excluir")
      }
      setDeleteTarget(null)
    })
  }

  const handleToggleActive = (threshold: AlertThreshold) => {
    startTransition(async () => {
      const result = await updateAlertThreshold(
        threshold.id,
        threshold.name,
        threshold.metric,
        threshold.operator,
        threshold.value,
        threshold.message,
        !threshold.is_active
      )
      if (result.success) {
        setThresholds(
          thresholds.map((t) =>
            t.id === threshold.id ? { ...t, is_active: !t.is_active } : t
          )
        )
      }
    })
  }

  const getMetricLabel = (m: string) =>
    METRICS.find((met) => met.value === m)?.label ?? m
  const getOperatorLabel = (op: string) =>
    OPERATORS.find((o) => o.value === op)?.label ?? op

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alertas e Thresholds</h2>
          <p className="text-sm text-muted-foreground">
            Configure limites para gerar alertas automáticos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Alerta
        </Button>
      </div>

      {thresholds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum alerta configurado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {thresholds.map((threshold) => (
            <Card
              key={threshold.id}
              className={!threshold.is_active ? "opacity-60" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        threshold.is_active
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <CardTitle className="text-base">
                      {threshold.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={threshold.is_active}
                      onCheckedChange={() => handleToggleActive(threshold)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(threshold)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(threshold)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {getMetricLabel(threshold.metric)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {getOperatorLabel(threshold.operator)}
                  </span>
                  <Badge variant="secondary">{threshold.value}</Badge>
                </div>
                {threshold.message && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    &ldquo;{threshold.message}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingThreshold ? "Editar Alerta" : "Novo Alerta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Alerta</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Muitos check-ins pendentes"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Métrica</Label>
                <Select value={metric} onValueChange={setMetric}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METRICS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Operador</Label>
                <Select
                  value={operator}
                  onValueChange={(v) => setOperator(v as "gt" | "lt" | "eq")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mensagem do Alerta</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensagem que será exibida quando o alerta for disparado"
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
            <AlertDialogTitle>Excluir alerta?</AlertDialogTitle>
            <AlertDialogDescription>
              O alerta <strong>{deleteTarget?.name}</strong> será excluído.
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
