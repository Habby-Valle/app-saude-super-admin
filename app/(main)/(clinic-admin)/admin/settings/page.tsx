import { Suspense } from "react"
import { getMyClinic } from "./actions"
import { ClinicLogoManager } from "./clinic-logo-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
