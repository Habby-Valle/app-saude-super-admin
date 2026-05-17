"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { ShiftTable } from "./shift-table"
import type { ShiftWithDetails } from "@/app/(main)/(super-admin)/super-admin/shifts/actions"

interface ShiftTableClientProps {
  shifts: ShiftWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  status: string
  clinicId: string
  clinics: { id: string; name: string }[]
}

export function ShiftTableClient({
  shifts,
  total,
  page,
  pageSize,
  search,
  status,
  clinicId,
  clinics,
}: ShiftTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { search, status, clinicId, page: String(page) }
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
    [router, pathname, search, status, clinicId, page]
  )

  return (
    <ShiftTable
      shifts={shifts}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      clinicId={clinicId}
      clinics={clinics}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onStatusChange={(v) => updateParams({ status: v, page: "1" })}
      onClinicChange={(v) => updateParams({ clinicId: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
      onPageSizeChange={(v) => updateParams({ page: "1", pageSize: String(v) })}
    />
  )
}
