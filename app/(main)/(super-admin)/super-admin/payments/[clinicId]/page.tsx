import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  getClinicPayments,
  getClinicPaymentStats,
  getClinicInfo,
} from "./actions"
import { PaymentsTable } from "./payments-table"
import { ClinicPaymentStatsCards } from "./clinic-payment-stats-cards"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Extrato - Super Admin",
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

async function PaymentsContent({ clinicId }: { clinicId: string }) {
  const [payments, stats, clinic] = await Promise.all([
    getClinicPayments(clinicId),
    getClinicPaymentStats(clinicId),
    getClinicInfo(clinicId),
  ])

  if (!clinic) {
    notFound()
  }

  return (
    <>
      <ClinicPaymentStatsCards stats={stats} />

      <div className="flex items-center gap-2">
        <Link href="/super-admin/payments">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-lg font-semibold">{clinic.name}</h2>
        {clinic.email && (
          <span className="text-sm text-muted-foreground">
            ({clinic.email})
          </span>
        )}
      </div>

      <PaymentsTable payments={payments} />
    </>
  )
}

export default async function ClinicPaymentsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const { clinicId } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Extrato da Clínica
        </h1>
        <p className="text-muted-foreground">
          Histórico de pagamentos da clínica
        </p>
      </div>

      <Suspense fallback={<PaymentsSkeleton />}>
        <PaymentsContent clinicId={clinicId} />
      </Suspense>
    </div>
  )
}
