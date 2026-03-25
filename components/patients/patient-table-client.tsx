"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { PatientTable } from "./patient-table"
import type { PatientWithDetails } from "@/app/(main)/patients/actions"

interface PatientTableClientProps {
  patients: PatientWithDetails[]
  total: number
  page: number
  pageSize: number
  search: string
  clinicId: string
  clinics: { id: string; name: string }[]
}

export function PatientTableClient({
  patients,
  total,
  page,
  pageSize,
  search,
  clinicId,
  clinics,
}: PatientTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      const current = { search, clinicId, page: String(page) }
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
    [router, pathname, search, clinicId, page]
  )

  return (
    <PatientTable
      patients={patients}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      clinicId={clinicId}
      clinics={clinics}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onClinicChange={(v) => updateParams({ clinicId: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
    />
  )
}
