"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { ShiftTable } from "./shift-table"
import type { ShiftWithDetails, SelectOption } from "@/app/(main)/(clinic-admin)/admin/shifts/actions"

interface ShiftTableClientProps {
  shifts: ShiftWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  status: string
  patients: SelectOption[]
}

export function ShiftTableClient({
  shifts,
  total,
  page,
  pageSize,
  search,
  status,
  patients,
}: ShiftTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { search, status, page: String(page) }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (!v || v === "1" || v === "all") {
          if (k === "page" && v !== "1") params.set(k, v)
          return
        }
        params.set(k, v)
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, search, status, page]
  )

  return (
    <ShiftTable
      shifts={shifts}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      patients={patients}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onStatusChange={(v) => updateParams({ status: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
    />
  )
}
