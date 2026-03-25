'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { UserTable } from './user-table'
import type { User, UserRole } from '@/types/database'
import type { Clinic } from '@/types/database'

interface UserTableWrapperProps {
  users: User[]
  total: number
  page: number
  pageSize: number
  search: string
  role: UserRole | 'all'
  clinicId: string
  clinics: Pick<Clinic, 'id' | 'name'>[]
}

export function UserTableWrapper({
  users,
  total,
  page,
  pageSize,
  search,
  role,
  clinicId,
  clinics,
}: UserTableWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all' && value !== '1') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset page on filter change
      if (key !== 'page') params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <UserTable
      users={users}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      role={role}
      clinicId={clinicId}
      clinics={clinics}
      onSearchChange={(v) => updateParam('search', v)}
      onRoleChange={(v) => updateParam('role', v)}
      onClinicChange={(v) => updateParam('clinic_id', v)}
      onPageChange={(v) => updateParam('page', String(v))}
    />
  )
}
