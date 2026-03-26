"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { ChecklistTable } from "./checklist-table"
import type { ChecklistWithDetails } from "@/app/(main)/(super-admin)/checklists/actions"

interface ChecklistTableClientProps {
  checklists: ChecklistWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  scope: string
  clinics: { id: string; name: string }[]
}

export function ChecklistTableClient({
  checklists,
  total,
  page,
  pageSize,
  search,
  scope,
  clinics,
}: ChecklistTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { search, scope, page: String(page) }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all" && v !== "1" && k !== "page") {
          params.set(k, v)
        } else if (k === "page" && v !== "1") {
          params.set(k, v)
        }
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, search, scope, page]
  )

  return (
    <ChecklistTable
      checklists={checklists}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      scope={scope}
      clinics={clinics}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onScopeChange={(v) => updateParams({ scope: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
    />
  )
}
