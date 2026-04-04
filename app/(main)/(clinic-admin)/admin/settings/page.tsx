import { Suspense } from "react"
import { getMyClinic } from "./actions"
import { ClinicLogoManager } from "./clinic-logo-manager"
import { ClinicThemePicker } from "./clinic-theme-picker"
import { AccountSettings } from "@/components/clinic-admin/settings/account-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_THEME } from "@/lib/clinic-themes"
import type { ClinicThemeId } from "@/lib/clinic-themes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building2 } from "lucide-react"

export const metadata = {
  title: "Configurações da Clínica",
}

async function SettingsContent() {
  const clinic = await getMyClinic()

  if (!clinic) {
    return (
      <p className="text-sm text-muted-foreground">
        Clínica não encontrada.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">{clinic.name}</p>
      </div>

      <Tabs defaultValue="clinic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Conta
          </TabsTrigger>
          <TabsTrigger value="clinic" className="gap-2">
            <Building2 className="h-4 w-4" />
            Clínica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="clinic">
          <div className="space-y-6">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle>Logo da clínica</CardTitle>
                <CardDescription>
                  A logo será exibida nas listagens e no painel administrativo.
                  Use uma imagem PNG, JPG ou WEBP de até 2MB.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClinicLogoManager
                  clinicId={clinic.id}
                  currentLogoUrl={clinic.logo_url}
                />
              </CardContent>
            </Card>

            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle>Tema de cores</CardTitle>
                <CardDescription>
                  Escolha a cor principal do painel da sua clínica.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClinicThemePicker
                  currentTheme={(clinic.theme_color as ClinicThemeId) ?? DEFAULT_THEME}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="max-w-lg rounded-lg border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
