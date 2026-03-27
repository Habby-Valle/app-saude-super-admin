'use server'

import { requireSuperAdmin } from '@/lib/auth'

export interface DashboardKPIs {
  totalClinics: number
  activeClinics: number
  totalPatients: number
  totalUsers: number
  totalCaregivers: number
  activeShifts: number
  checklistsToday: number
  activeSosAlerts: number
  acknowledgedSosAlerts: number
}

export interface ClinicStat {
  id: string
  name: string
  status: string
  patientCount: number
  caregiverCount: number
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const { supabase } = await requireSuperAdmin()

  const [
    { count: totalClinics },
    { count: activeClinics },
    { count: totalPatients },
    { count: totalUsers },
    { count: totalCaregivers },
    { count: activeShifts },
    { count: checklistsToday },
    { count: activeSosAlerts },
    { count: acknowledgedSosAlerts },
  ] = await Promise.all([
    supabase.from('clinics').select('*', { count: 'exact', head: true }),
    supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'super_admin'),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'caregiver'),
    supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    supabase
      .from('shift_checklists')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabase
      .from('sos_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('sos_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'acknowledged'),
  ])

  return {
    totalClinics: totalClinics ?? 0,
    activeClinics: activeClinics ?? 0,
    totalPatients: totalPatients ?? 0,
    totalUsers: totalUsers ?? 0,
    totalCaregivers: totalCaregivers ?? 0,
    activeShifts: activeShifts ?? 0,
    checklistsToday: checklistsToday ?? 0,
    activeSosAlerts: activeSosAlerts ?? 0,
    acknowledgedSosAlerts: acknowledgedSosAlerts ?? 0,
  }
}

export async function getClinicStats(): Promise<ClinicStat[]> {
  const { supabase } = await requireSuperAdmin()

  const { data: clinics } = await supabase
    .from('clinics')
    .select('id, name, status')
    .order('name')
    .limit(10)

  if (!clinics?.length) return []

  const stats = await Promise.all(
    clinics.map(async (clinic) => {
      const [{ count: patientCount }, { count: caregiverCount }] =
        await Promise.all([
          supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinic.id),
          supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinic.id)
            .eq('role', 'caregiver'),
        ])

      return {
        id: clinic.id,
        name: clinic.name,
        status: clinic.status,
        patientCount: patientCount ?? 0,
        caregiverCount: caregiverCount ?? 0,
      }
    }),
  )

  return stats
}
