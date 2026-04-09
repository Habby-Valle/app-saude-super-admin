import { Suspense } from "react"
import { getAllPayments, getPaymentStats } from "./actions"
import { PaymentsTable } from "./payments-table"
import { PaymentStatsCards } from "./payment-stats-cards"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Pagamentos - Super Admin",
}

function PaymentsSkeleton() {
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

async function PaymentsContent() {
  const [payments, stats] = await Promise.all([
    getAllPayments(),
    getPaymentStats(),
  ])

  return (
    <>
      <PaymentStatsCards stats={stats} />
      <PaymentsTable payments={payments} />
    </>
  )
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground">
          Histórico de pagamentos de todas as clínicas
        </p>
      </div>

      <Suspense fallback={<PaymentsSkeleton />}>
        <PaymentsContent />
      </Suspense>
    </div>
  )
}
