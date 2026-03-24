import type { UserRole } from './database'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  clinic_id: string | null
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  expires_at: number
}
