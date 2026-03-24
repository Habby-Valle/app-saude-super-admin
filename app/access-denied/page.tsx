import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Acesso negado</h1>
        <p className="text-muted-foreground max-w-sm">
          Você não tem permissão para acessar este painel. É necessário ter
          o papel de <strong>Super Admin</strong>.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/auth/login">Voltar ao login</Link>
      </Button>
    </div>
  )
}
