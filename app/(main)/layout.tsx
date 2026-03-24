import { Providers } from '@/components/layout/providers'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar — visível apenas em desktop (md+) */}
        <div className="hidden md:flex md:shrink-0">
          <Sidebar />
        </div>

        {/* Área principal: topbar + conteúdo */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
