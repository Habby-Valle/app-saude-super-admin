import { Providers } from "@/components/layout/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getClinicActiveSosCount } from "@/lib/sos-count"
import { SuperAdminBanner } from "@/components/clinic-admin/super-admin-banner"
import { getMyClinic } from "./settings/actions"
import { getTheme } from "@/lib/clinic-themes"

export default async function ClinicAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeSosCount, clinic] = await Promise.all([
    getClinicActiveSosCount(),
    getMyClinic(),
  ])

  const theme = getTheme(clinic?.theme_color)

  return (
    <Providers>
      <div
        className="clinic-admin flex h-screen overflow-hidden bg-background"
        style={{ "--theme-hue": String(theme.hue) } as React.CSSProperties}
      >
        <div className="hidden md:flex md:shrink-0">
          <Sidebar
            variant="clinic-admin"
            activeSosCount={activeSosCount}
            clinicLogoUrl={clinic?.logo_url}
            clinicName={clinic?.name}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <SuperAdminBanner />
          <Topbar variant="clinic-admin" activeSosCount={activeSosCount} />

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
