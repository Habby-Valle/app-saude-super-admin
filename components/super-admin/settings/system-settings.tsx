"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertTriangle, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

interface SystemSettingsProps {
  initialSettings: {
    maintenance_mode: boolean
    maintenance_message: string
    maintenance_planned_end: string | null
  }
}

function toISOStringLocal(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString()
}

export function SystemSettings({ initialSettings }: SystemSettingsProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialSettings.maintenance_mode
  )
  const [message, setMessage] = useState(initialSettings.maintenance_message)
  const [plannedEnd, setPlannedEnd] = useState(
    initialSettings.maintenance_planned_end
      ? new Date(initialSettings.maintenance_planned_end)
          .toISOString()
          .slice(0, 16)
      : ""
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance_mode: maintenanceMode,
          maintenance_message: message,
          maintenance_planned_end: plannedEnd
            ? toISOStringLocal(plannedEnd)
            : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Configurações salvas com sucesso")
      } else {
        toast.error(result.error || "Erro ao salvar configurações")
      }
    } catch {
      toast.error("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Modo Manutenção
          </CardTitle>
          <CardDescription>
            Quando ativado, os painéis das clínicas e o app mobile exibirão uma
            página de manutenção. O Super Admin continuará tendo acesso normal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground">
                {maintenanceMode
                  ? "Sistema em manutenção"
                  : "Sistema operacional"}
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem de Manutenção</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensagem exibida durante a manutenção"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedEnd">Previsão de Retorno (opcional)</Label>
            <Input
              id="plannedEnd"
              type="datetime-local"
              value={plannedEnd}
              onChange={(e) => setPlannedEnd(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Data e hora prevista para o sistema voltar a funcionar.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
