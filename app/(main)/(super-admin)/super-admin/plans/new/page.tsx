"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PlanForm } from "@/components/super-admin/plans/plan-form"
import { createPlan } from "../actions"
import type { PlanFormValues } from "@/lib/validations/plan"

export default function NewPlanPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(values: PlanFormValues) {
    setIsLoading(true)
    setError(null)

    const result = await createPlan(values)

    if (result.success) {
      router.push("/super-admin/plans")
      router.refresh()
    } else {
      setError(result.error ?? "Erro ao criar plano")
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
          <h1 className="text-2xl font-bold tracking-tight">Novo Plano</h1>
          <p className="text-muted-foreground">
            Crie um novo plano de assinatura.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="max-w-xl">
        <PlanForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
