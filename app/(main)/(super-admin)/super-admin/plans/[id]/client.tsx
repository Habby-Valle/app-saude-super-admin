"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PlanForm } from "@/components/super-admin/plans/plan-form"
import { updatePlan } from "../actions"
import type { PlanFormValues } from "@/lib/validations/plan"
import type { Plan } from "@/types/database"
import { Button } from "@/components/ui/button"

interface EditPlanPageClientProps {
  plan: Plan
}

export default function EditPlanPageClient({ plan }: EditPlanPageClientProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(values: PlanFormValues) {
    setIsLoading(true)
    setError(null)

    const result = await updatePlan(plan.id, values)

    if (result.success) {
      router.push("/super-admin/plans")
      router.refresh()
    } else {
      setError(result.error ?? "Erro ao atualizar plano")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Plano</h1>
          <p className="text-muted-foreground">
            Edite as informações do plano.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="max-w-xl">
        <PlanForm
          defaultValues={{
            name: plan.name,
            description: plan.description,
            price: plan.price,
            billing_cycle: plan.billing_cycle,
            is_active: plan.is_active,
            features: plan.features ?? [],
            max_users: plan.max_users,
            max_patients: plan.max_patients,
            max_storage: plan.max_storage,
            sort_order: plan.sort_order,
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
