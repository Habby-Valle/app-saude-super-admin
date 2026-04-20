import { getSystemSettings } from "@/lib/maintenance"
import { Wrench } from "lucide-react"

export const metadata = {
  title: "Sistema em Manutenção",
}

export default async function MaintenancePage() {
  const settings = await getSystemSettings()

  const message =
    settings.maintenance_message ||
    "Sistema em manutenção. Em breve retornaremos."

  const plannedEndDateStr = settings.maintenance_planned_end
  const plannedEndDate = plannedEndDateStr ? new Date(plannedEndDateStr) : null

  const formattedDate = plannedEndDate
    ? plannedEndDate.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "full",
        timeStyle: "short",
      })
    : null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="rounded-full bg-muted p-6">
          <Wrench className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sistema em Manutenção
          </h1>
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>

        {plannedEndDate && (
          <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
            <p className="font-medium">Previsão de retorno:</p>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Pedimos desculpas pelo inconvenience. Volte em alguns minutos.
        </p>
      </div>
    </div>
  )
}
