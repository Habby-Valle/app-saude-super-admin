"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { CaregiverTable } from "./caregiver-table"
import type { ClinicCaregiver } from "@/app/(main)/(clinic-admin)/admin/caregivers/actions"

interface CaregiverTableClientProps {
  caregivers: ClinicCaregiver[]
  total: number
  page: number
  pageSize: number
  search: string
}

export function CaregiverTableClient({
  caregivers,
  total,
  page,
  pageSize,
  search,
}: CaregiverTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { search, page: String(page) }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "1" && k !== "page") {
          params.set(k, v)
        } else if (k === "page" && v !== "1") {
          params.set(k, v)
        }
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, search, page]
  )

  return (
    <CaregiverTable
      caregivers={caregivers}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
    />
  )
}
