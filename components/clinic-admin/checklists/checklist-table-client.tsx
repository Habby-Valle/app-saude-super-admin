"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { ClinicChecklistTable } from "./checklist-table"
import type { ClinicChecklistWithDetails } from "@/app/(main)/(clinic-admin)/admin/checklists/actions"

interface ClinicChecklistTableClientProps {
  checklists: ClinicChecklistWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  scope: string
}

export function ClinicChecklistTableClient({
  checklists,
  total,
  page,
  pageSize,
  search,
  scope,
}: ClinicChecklistTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { search, scope, page: String(page) }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (!v || (k === "page" && v === "1") || (k === "scope" && v === "all"))
          return
        params.set(k, v)
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, search, scope, page]
  )

  return (
    <ClinicChecklistTable
      checklists={checklists}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      scope={scope}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onScopeChange={(v) => updateParams({ scope: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
      onPageSizeChange={(v) => updateParams({ page: "1", pageSize: String(v) })}
    />
  )
}
