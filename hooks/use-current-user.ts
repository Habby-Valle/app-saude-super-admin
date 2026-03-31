'use client'

import { useAuthStore } from '@/store/auth-store'

export function useCurrentUser() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  // _hasHydrated indica se o persist já leu o localStorage
  const hasHydrated = useAuthStore.persist?.hasHydrated?.() ?? true
  return { user, isLoading, hasHydrated }
}
