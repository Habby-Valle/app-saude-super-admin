"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { PatientTable } from "./patient-table"
import type { ClinicPatient } from "@/app/(main)/(clinic-admin)/admin/patients/actions"

interface PatientTableClientProps {
  patients: ClinicPatient[]
  total: number
  page: number
  pageSize: number
  search: string
}

export function PatientTableClient({
  patients,
  total,
  page,
  pageSize,
  search,
}: PatientTableClientProps) {
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
    <PatientTable
      patients={patients}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
      onPageSizeChange={(v) => updateParams({ page: "1", pageSize: String(v) })}
    />
  )
}
