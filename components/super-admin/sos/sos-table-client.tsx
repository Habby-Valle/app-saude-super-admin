"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { SosTable } from "./sos-table"
import type { SosAlertWithDetails } from "@/app/(main)/(super-admin)/super-admin/sos/actions"

interface SosTableClientProps {
  alerts: SosAlertWithDetails[]
  total: number
  page: number
  pageSize: number
  status: string
  clinicId: string
  clinics: { id: string; name: string }[]
}

export function SosTableClient({
  alerts,
  total,
  page,
  pageSize,
  status,
  clinicId,
  clinics,
}: SosTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { status, clinicId, page: String(page) }
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
    [router, pathname, status, clinicId, page]
  )

  return (
    <SosTable
      alerts={alerts}
      total={total}
      page={page}
      pageSize={pageSize}
      status={status}
      clinicId={clinicId}
      clinics={clinics}
      onStatusChange={(v) => updateParams({ status: v, page: "1" })}
      onClinicChange={(v) => updateParams({ clinicId: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
    />
  )
}
