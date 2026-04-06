import { Suspense } from "react"
import { getMyClinicPlan, getAllPlans } from "./actions"
import { PlanManagementClient } from "./plan-client"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Plano",
}

function PlanSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader } from "@/components/ui/card"

async function PlanContent() {
  const [currentPlan, allPlans] = await Promise.all([
    getMyClinicPlan(),
    getAllPlans(),
  ])

  return (
    <PlanManagementClient
      currentPlan={{
        plan: currentPlan?.plan ?? null,
        clinicPlan: currentPlan?.clinicPlan ?? null,
      }}
      availablePlans={allPlans}
    />
  )
}

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plano</h1>
        <p className="text-muted-foreground">
          Gerencie o plano da sua clínica.
        </p>
      </div>

      <Suspense fallback={<PlanSkeleton />}>
        <PlanContent />
      </Suspense>
    </div>
  )
}
