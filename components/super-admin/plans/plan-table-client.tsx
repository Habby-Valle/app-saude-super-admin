"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { PlanTable } from "./plan-table"
import type { Plan } from "@/types/database"

interface PlanTableClientProps {
  plans: Plan[]
  total: number
  page: number
  pageSize: number
  search: string
  isActive: string
}

export function PlanTableClient({
  plans,
  total,
  page,
  pageSize,
  search,
  isActive,
}: PlanTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const current = { search, isActive, page: String(page) }
      const merged = { ...current, ...updates }

      const params = new URLSearchParams()
      if (merged.search) params.set("search", merged.search)
      if (merged.isActive !== "all") params.set("isActive", merged.isActive)
      if (merged.page !== "1") params.set("page", merged.page)

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, search, isActive, page]
  )

  return (
    <PlanTable
      plans={plans}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      isActive={isActive}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onActiveChange={(v) => updateParams({ isActive: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
    />
  )
}
