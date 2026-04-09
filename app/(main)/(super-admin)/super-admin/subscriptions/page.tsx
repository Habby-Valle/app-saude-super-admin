import { Suspense } from "react"
import { getAllSubscriptions, getSubscriptionStats } from "./actions"
import { SubscriptionsTable } from "./subscriptions-table"
import { StatsCards } from "./stats-cards"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Assinaturas - Super Admin",
}

function SubscriptionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

async function SubscriptionsContent() {
  const [subscriptions, stats] = await Promise.all([
    getAllSubscriptions(),
    getSubscriptionStats(),
  ])

  return (
    <>
      <StatsCards stats={stats} />
      <SubscriptionsTable subscriptions={subscriptions} />
    </>
  )
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assinaturas</h1>
        <p className="text-muted-foreground">
          Gerencie as assinaturas de todas as clínicas
        </p>
      </div>

      <Suspense fallback={<SubscriptionsSkeleton />}>
        <SubscriptionsContent />
      </Suspense>
    </div>
  )
}
