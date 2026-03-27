import { Providers } from "@/components/layout/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getClinicActiveSosCount } from "@/lib/sos-count"

export default async function ClinicAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeSosCount = await getClinicActiveSosCount()

  return (
    <Providers>
      <div className="clinic-admin flex h-screen overflow-hidden bg-background">
        <div className="hidden md:flex md:shrink-0">
          <Sidebar variant="clinic-admin" activeSosCount={activeSosCount} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar variant="clinic-admin" activeSosCount={activeSosCount} />

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
