'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'app-saude-user-display',
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas nome e email — sem tokens, roles ou clinic_id
      partialize: (state) =>
        state.user
          ? { user: { name: state.user.name, email: state.user.email } }
          : {},
    }
  )
)
