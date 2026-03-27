import { Suspense } from "react"
import { Settings } from "lucide-react"
import { getPlans, getShiftCategories, getAlertThresholds } from "./actions"
import { SettingsTabs } from "@/components/super-admin/settings/settings-tabs"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Configurações",
}

async function SettingsContent() {
  const [plans, shiftCategories, alertThresholds] = await Promise.all([
    getPlans().catch(() => []),
    getShiftCategories().catch(() => []),
    getAlertThresholds().catch(() => []),
  ])

  return (
    <SettingsTabs
      plans={plans}
      shiftCategories={shiftCategories}
      alertThresholds={alertThresholds}
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
          Gerencie planos, categorias e alertas da plataforma.
        </p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
