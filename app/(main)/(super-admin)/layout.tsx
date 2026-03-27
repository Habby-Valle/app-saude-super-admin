import { Providers } from "@/components/layout/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getActiveSosCount } from "@/lib/sos-count"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeSosCount = await getActiveSosCount()

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden md:flex md:shrink-0">
          <Sidebar variant="super-admin" activeSosCount={activeSosCount} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar variant="super-admin" activeSosCount={activeSosCount} />

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
