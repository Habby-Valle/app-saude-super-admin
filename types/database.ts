export type UserRole = 'super_admin' | 'clinic_admin' | 'caregiver' | 'family' | 'emergency_contact'

export type ClinicStatus = 'active' | 'inactive' | 'suspended'

export type ShiftStatus = 'in_progress' | 'completed' | 'cancelled'

export type ChecklistItemType = 'text' | 'boolean' | 'select' | 'number'

// ─── Clinics ─────────────────────────────────────────────────────────────────

export interface Clinic {
  id: string
  name: string
  cnpj: string
  status: ClinicStatus
  plan?: string
  logo_url?: string | null
  theme_color?: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  clinic_id: string | null
  name: string
  email: string
  role: UserRole
  status: 'active' | 'blocked' | 'pending'
  created_at: string
  last_sign_in_at?: string
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export interface Patient {
  id: string
  clinic_id: string
  contractor_id: string | null
  name: string
  birth_date: string
  status: 'active' | 'inactive'
  created_at: string
}

// ─── Caregiver <> Patient ─────────────────────────────────────────────────────

export interface CaregiverPatient {
  id: string
  caregiver_id: string
  patient_id: string
}

// ─── Emergency Contacts ───────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string
  patient_id: string
  user_id: string
  priority: number
}

// ─── Checklists (Templates) ───────────────────────────────────────────────────

export interface Checklist {
  id: string
  clinic_id: string | null // null = template global
  name: string
  icon: string | null
  order: number
  created_at: string
}

export interface ChecklistItem {
  id: string
  checklist_id: string
  name: string
  type: ChecklistItemType
  required: boolean
  has_observation: boolean
}

export interface ChecklistItemOption {
  id: string
  checklist_item_id: string
  label: string
  value: string
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export interface Shift {
  id: string
  clinic_id: string
  patient_id: string
  caregiver_id: string
  started_at: string
  ended_at: string | null
  status: ShiftStatus
}

// ─── Shift Execution ──────────────────────────────────────────────────────────

export interface ShiftChecklist {
  id: string
  shift_id: string
  checklist_id: string
  status: 'pending' | 'completed'
  observation: string | null
}

export interface ShiftChecklistItem {
  id: string
  shift_checklist_id: string
  checklist_item_id: string
  value: string | null
  option_id: string | null
  observation: string | null
}

// ─── Audit Log (futuro) ───────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity: string
  entity_id: string
  metadata: Record<string, unknown>
  created_at: string
}
