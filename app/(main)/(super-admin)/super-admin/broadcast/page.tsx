import { Suspense } from "react"
import { Megaphone } from "lucide-react"
import { BroadcastClient } from "./broadcast-client"

export const metadata = {
  title: "Notificações Broadcast",
}

interface BroadcastPageProps {
  searchParams: Promise<{
    page?: string
  }>
}

async function BroadcastContent({ searchParams }: BroadcastPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 20

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/broadcast`,
    { cache: "no-store" }
  )
  const notifications = await response.json()

  return (
    <BroadcastClient
      notifications={Array.isArray(notifications) ? notifications : []}
      page={page}
      pageSize={pageSize}
    />
  )
}

function BroadcastSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded border" />
    </div>
  )
}

export default function BroadcastPage(props: BroadcastPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Megaphone className="h-6 w-6" />
          Notificações Broadcast
        </h1>
        <p className="mt-1 text-muted-foreground">
          Envie notifications em massa para usuários da plataforma.
        </p>
      </div>

      <Suspense fallback={<BroadcastSkeleton />}>
        <BroadcastContent {...props} />
      </Suspense>
    </div>
  )
}
