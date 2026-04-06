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

// ─── Plans ────────────────────────────────────────────────────────────────────

export type PlanStatus = 'trial' | 'active' | 'expired' | 'cancelled'
export type BillingCycle = 'monthly' | 'quarterly' | 'annual'
export type BenefitCategory = 'feature' | 'limit' | 'addon' | 'integration'

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  billing_cycle: BillingCycle
  is_active: boolean
  features: string[]
  max_users: number
  max_patients: number
  max_storage: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PlanBenefit {
  id: string
  name: string
  code: string
  category: BenefitCategory
  icon: string
  is_active: boolean
  created_at: string
}

export interface PlanBenefitRelation {
  id: string
  plan_id: string
  benefit_id: string
  is_enabled: boolean
  created_at: string
}

export interface ClinicPlan {
  id: string
  clinic_id: string
  plan_id: string
  status: PlanStatus
  started_at: string
  expires_at: string
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface ClinicPlanBenefit {
  id: string
  clinic_plan_id: string
  benefit_id: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface UserBenefit {
  id: string
  user_id: string
  benefit_id: string
  is_enabled: boolean
  expires_at: string | null
  granted_by: string
  created_at: string
  updated_at: string
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
