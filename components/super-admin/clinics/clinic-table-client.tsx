"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { ClinicTable } from "./clinic-table"
import type { Clinic } from "@/types/database"

interface ClinicTableClientProps {
  clinics: Clinic[]
  total: number
  page: number
  pageSize: number
  search: string
  status: string
}

export function ClinicTableClient({
  clinics,
  total,
  page,
  pageSize,
  search,
  status,
}: ClinicTableClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams()
      // Mantém os valores atuais, substitui os modificados
      const current = { search, status, page: String(page) }
      const merged = { ...current, ...updates }

      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "all" && v !== "1" && k !== "page") params.set(k, v)
        else if (k === "page" && v !== "1") params.set(k, v)
      })

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, search, status, page]
  )

  return (
    <ClinicTable
      clinics={clinics}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      status={status}
      onSearchChange={(v) => updateParams({ search: v, page: "1" })}
      onStatusChange={(v) => updateParams({ status: v, page: "1" })}
      onPageChange={(v) => updateParams({ page: String(v) })}
      onPageSizeChange={(v) => updateParams({ page: "1", pageSize: String(v) })}
    />
  )
}
