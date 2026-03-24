'use client'

import { useAuthStore } from '@/store/auth-store'

export function useCurrentUser() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  return { user, isLoading }
}
