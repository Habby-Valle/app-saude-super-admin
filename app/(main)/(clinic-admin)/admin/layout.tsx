import { Providers } from "@/components/layout/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default function ClinicAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="clinic-admin flex h-screen overflow-hidden bg-background">
        <div className="hidden md:flex md:shrink-0">
          <Sidebar variant="clinic-admin" />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
