"use server"

import { requireClinicAdmin } from "@/lib/auth"
import type { Patient, User, Shift } from "@/types/database"

export interface ClinicDashboardStats {
  patients: {
    total: number
    active: number
    newThisMonth: number
  }
  caregivers: {
    total: number
    active: number
  }
  shifts: {
    today: number
    completedToday: number
    pending: number
  }
  sos: {
    active: number
    pendingToday: number
  }
  recentShifts: Array<{
    id: string
    patient: { id: string; name: string }
    caregiver: { id: string; name: string }
    started_at: string
    ended_at: string | null
    status: string
  }>
  clinic: {
    id: string
    name: string
  } | null
}

export async function getClinicDashboardStats(): Promise<ClinicDashboardStats | null> {
  try {
    const { supabase, clinicId, isSuperAdmin, user } =
      await requireClinicAdmin()

    const effectiveClinicId = clinicId

    if (!effectiveClinicId) {
      return null
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      patientsResult,
      caregiversResult,
      shiftsTodayResult,
      sosActiveResult,
      clinicResult,
    ] = await Promise.all([
      supabase
        .from("patients")
        .select("id, created_at", { count: "exact" })
        .eq("clinic_id", effectiveClinicId),
      supabase
        .from("users")
        .select("id", { count: "exact" })
        .eq("clinic_id", effectiveClinicId)
        .eq("role", "caregiver"),
      supabase
        .from("shifts")
        .select(
          "id, status, started_at, ended_at, patient:patients(id, name), caregiver:users(id, name)",
          { count: "exact" }
        )
        .eq("clinic_id", effectiveClinicId)
        .gte("started_at", today.toISOString())
        .lt("started_at", tomorrow.toISOString()),
      supabase
        .from("sos_alerts")
        .select("id, created_at", { count: "exact" })
        .eq("clinic_id", effectiveClinicId)
        .eq("status", "active"),
      supabase
        .from("clinics")
        .select("id, name")
        .eq("id", effectiveClinicId)
        .single(),
    ])

    const recentShiftsResult = await supabase
      .from("shifts")
      .select(
        `
        id,
        started_at,
        ended_at,
        status,
        patient:patients(id, name),
        caregiver:users!shifts_caregiver_id_fkey(id, name)
      `
      )
      .eq("clinic_id", effectiveClinicId)
      .order("started_at", { ascending: false })
      .limit(5)

    const recentShifts = (recentShiftsResult.data ?? []).map(
      (shift: Record<string, unknown>) => ({
        id: shift.id as string,
        patient: shift.patient as { id: string; name: string },
        caregiver: shift.caregiver as { id: string; name: string },
        started_at: shift.started_at as string,
        ended_at: shift.ended_at as string | null,
        status: shift.status as string,
      })
    )

    return {
      patients: {
        total: patientsResult.count ?? 0,
        active: patientsResult.count ?? 0,
        newThisMonth: 0,
      },
      caregivers: {
        total: caregiversResult.count ?? 0,
        active: caregiversResult.count ?? 0,
      },
      shifts: {
        today: shiftsTodayResult.count ?? 0,
        completedToday: (shiftsTodayResult.data ?? []).filter(
          (s: Record<string, unknown>) => s.status === "completed"
        ).length,
        pending: (shiftsTodayResult.data ?? []).filter(
          (s: Record<string, unknown>) => s.status === "in_progress"
        ).length,
      },
      sos: {
        active: sosActiveResult.count ?? 0,
        pendingToday: sosActiveResult.count ?? 0,
      },
      recentShifts,
      clinic: clinicResult.data,
    }
  } catch (error) {
    console.error("[getClinicDashboardStats]", error)
    return null
  }
}
