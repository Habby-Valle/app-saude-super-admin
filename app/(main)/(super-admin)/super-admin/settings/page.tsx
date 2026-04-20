import { Suspense } from "react"
import { Settings } from "lucide-react"
import {
  getPlans,
  getAlertThresholds,
  getSystemSettingsAction,
} from "./actions"
import { getLgpdConfig } from "./lgpd-actions"
import { SettingsTabs } from "@/components/super-admin/settings/settings-tabs"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Configurações",
}

async function SettingsContent() {
  const [plans, alertThresholds, lgpdConfig, systemSettings] =
    await Promise.all([
      getPlans().catch(() => []),
      getAlertThresholds().catch(() => []),
      getLgpdConfig().catch(() => ({
        retention_policies: [],
        encryption_key_configured: false,
        encryption_statuses: [],
      })),
      getSystemSettingsAction().catch(() => ({
        maintenance_mode: false,
        maintenance_message: "Sistema em manutenção. Em breve retornaremos.",
        maintenance_planned_end: null,
        app_name: "App Saúde",
        app_url: "",
        app_site_url: "",
        app_store_url: "",
        play_store_url: "",
        support_email: "",
        support_phone: "",
        support_whatsapp: "",
        admin_logo_url: "",
        cnpj: "",
        address: "",
        timezone: "America/Sao_Paulo",
        currency: "BRL",
      })),
    ])

  return (
    <SettingsTabs
      plans={plans}
      alertThresholds={alertThresholds}
      lgpdConfig={lgpdConfig}
      systemSettings={systemSettings}
    />
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Settings className="h-6 w-6" />
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie planos e alertas da plataforma.
        </p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
