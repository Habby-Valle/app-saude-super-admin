"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { ClinicSosTable } from "./sos-table"
import type { ClinicSosAlertWithDetails } from "@/app/(main)/(clinic-admin)/admin/sos/actions"

interface ClinicSosTableClientProps {
  alerts: ClinicSosAlertWithDetails[]
  total: number
  page: number
  pageSize: number
  status: string
}

export function ClinicSosTableClient({
  alerts,
  total,
  page,
  pageSize,
  status,
}: ClinicSosTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { status, page: String(page) }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all" && v !== "1") {
          params.set(k, v)
        } else if (k === "page" && v !== "1") {
          params.set(k, v)
        }
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, status, page]
  )

  return (
    <ClinicSosTable
      alerts={alerts}
      total={total}
      page={page}
      pageSize={pageSize}
      status={status}
      onStatusChange={(v) => updateParams({ status: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
      onPageSizeChange={(v) => updateParams({ page: "1", pageSize: String(v) })}
    />
  )
}
