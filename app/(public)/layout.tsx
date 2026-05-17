export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <span className="text-lg font-bold tracking-tight">Zelo</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Zelo — Plataforma de Gestão de Cuidados
      </footer>
    </div>
  )
}
