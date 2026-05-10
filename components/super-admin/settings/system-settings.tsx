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
import {
  AlertTriangle,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react"
import { toast } from "sonner"

interface SystemSettingsProps {
  initialSettings: {
    maintenance_mode: boolean
    maintenance_message: string
    maintenance_planned_end: string | null
    app_name: string
    app_url: string
    app_site_url: string
    app_store_url: string
    play_store_url: string
    support_email: string
    support_phone: string
    support_whatsapp: string
    admin_logo_url: string
    cnpj: string
    address: string
    timezone: string
    currency: string
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

  const [appName, setAppName] = useState(initialSettings.app_name)
  const [appUrl, setAppUrl] = useState(initialSettings.app_url)
  const [appSiteUrl, setAppSiteUrl] = useState(initialSettings.app_site_url)
  const [appStoreUrl, setAppStoreUrl] = useState(initialSettings.app_store_url)
  const [playStoreUrl, setPlayStoreUrl] = useState(
    initialSettings.play_store_url
  )
  const [supportEmail, setSupportEmail] = useState(
    initialSettings.support_email
  )
  const [supportPhone, setSupportPhone] = useState(
    initialSettings.support_phone
  )
  const [supportWhatsapp, setSupportWhatsapp] = useState(
    initialSettings.support_whatsapp
  )
  const [adminLogoUrl, setAdminLogoUrl] = useState(
    initialSettings.admin_logo_url
  )
  const [cnpj, setCnpj] = useState(initialSettings.cnpj)
  const [address, setAddress] = useState(initialSettings.address)

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
          app_name: appName,
          app_url: appUrl,
          app_site_url: appSiteUrl,
          app_store_url: appStoreUrl,
          play_store_url: playStoreUrl,
          support_email: supportEmail,
          support_phone: supportPhone,
          support_whatsapp: supportWhatsapp,
          admin_logo_url: adminLogoUrl,
          cnpj,
          address,
          timezone: "America/Sao_Paulo",
          currency: "BRL",
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
          <CardDescription>
            Configure as informações públicas do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appName">Nome do App</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="App Saúde"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appUrl">URL do Painel</Label>
              <Input
                id="appUrl"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://app-saude.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSiteUrl">URL do Site</Label>
              <Input
                id="appSiteUrl"
                value={appSiteUrl}
                onChange={(e) => setAppSiteUrl(e.target.value)}
                placeholder="https://site.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminLogoUrl">Logo Admin (URL)</Label>
              <Input
                id="adminLogoUrl"
                value={adminLogoUrl}
                onChange={(e) => setAdminLogoUrl(e.target.value)}
                placeholder="https://cdn.example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Links dos Apps
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={appStoreUrl}
                onChange={(e) => setAppStoreUrl(e.target.value)}
                placeholder="Link App Store (iOS)"
              />
              <Input
                value={playStoreUrl}
                onChange={(e) => setPlayStoreUrl(e.target.value)}
                placeholder="Link Google Play"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contato
          </CardTitle>
          <CardDescription>
            Informações de contato para suporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">
                <Mail className="mr-1 inline h-3 w-3" />
                Email de Suporte
              </Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="suporte@appsaude.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportPhone">Telefone</Label>
              <Input
                id="supportPhone"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportWhatsapp">WhatsApp</Label>
              <Input
                id="supportWhatsapp"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                placeholder="https://wa.me/5511999999999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="mr-1 inline h-3 w-3" />
              Endereço
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua exemplo, 123 - Cidade - Estado"
              rows={2}
            />
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
