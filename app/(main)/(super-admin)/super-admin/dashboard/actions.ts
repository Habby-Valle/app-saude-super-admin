"use server"

import { requireSuperAdmin } from "@/lib/auth"

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
    supabase.from("clinics").select("*", { count: "exact", head: true }),
    supabase
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .neq("role", "super_admin"),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "caregiver"),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("shift_checklists")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", new Date().toISOString().split("T")[0]),
    supabase
      .from("sos_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("sos_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "acknowledged"),
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

export interface RecentActivity {
  id: string
  action: string
  entity: string
  user_name: string
  user_email: string
  created_at: string
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, entity, created_at, user:users!user_id(name, email)")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("[getRecentActivity]", error)
    return []
  }

  return (data ?? []).map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    user_name: (log.user as { name: string }[] | null)?.[0]?.name ?? "—",
    user_email: (log.user as { email: string }[] | null)?.[0]?.email ?? "—",
    created_at: log.created_at,
  }))
}

export async function getClinicStats(): Promise<ClinicStat[]> {
  const { supabase } = await requireSuperAdmin()

  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, status")
    .order("name")
    .limit(10)

  if (!clinics?.length) return []

  const stats = await Promise.all(
    clinics.map(async (clinic) => {
      const [{ count: patientCount }, { count: caregiverCount }] =
        await Promise.all([
          supabase
            .from("patients")
            .select("*", { count: "exact", head: true })
            .eq("clinic_id", clinic.id),
          supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("clinic_id", clinic.id)
            .eq("role", "caregiver"),
        ])

      return {
        id: clinic.id,
        name: clinic.name,
        status: clinic.status,
        patientCount: patientCount ?? 0,
        caregiverCount: caregiverCount ?? 0,
      }
    })
  )

  return stats
}

export interface RevenueMetrics {
  mrr: number
  arr: number
  expected30Days: number
  forecast: { month: string; revenue: number }[]
  activeSubscriptions: number
  trialSubscriptions: number
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const { supabase } = await requireSuperAdmin()

  const { data: subscriptions, error } = await supabase
    .from("clinic_plans")
    .select(
      `
      id,
      status,
      expires_at,
      trial_ends_at,
      plans (
        price,
        billing_cycle
      )
    `
    )
    .in("status", ["active", "trial"])

  if (error || !subscriptions?.length) {
    return {
      mrr: 0,
      arr: 0,
      expected30Days: 0,
      forecast: [],
      activeSubscriptions: 0,
      trialSubscriptions: 0,
    }
  }

  const now = new Date()
  let mrr = 0
  let expected30Days = 0
  let activeCount = 0
  let trialCount = 0
  const expiringSoon: { expiresAt: Date; monthlyValue: number }[] = []

  for (const sub of subscriptions) {
    let price = 0
    let billingCycle = "monthly"

    if (sub.plans) {
      if (Array.isArray(sub.plans)) {
        const plan = sub.plans[0] as {
          price: number
          billing_cycle: string
        } | null
        price = plan?.price ?? 0
        billingCycle = plan?.billing_cycle ?? "monthly"
      } else {
        price = (sub.plans as { price: number }).price ?? 0
        billingCycle =
          (sub.plans as { billing_cycle: string }).billing_cycle ?? "monthly"
      }
    }

    let monthlyValue = price
    if (billingCycle === "yearly") {
      monthlyValue = price / 12
    } else if (billingCycle === "quarterly") {
      monthlyValue = price / 3
    }

    if (sub.status === "active") {
      mrr += monthlyValue
      activeCount++
      expected30Days += monthlyValue

      const expiresAt = new Date(sub.expires_at)
      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 90) {
        expiringSoon.push({ expiresAt, monthlyValue })
      }
    } else if (sub.status === "trial") {
      trialCount++
      if (sub.trial_ends_at) {
        const trialEnds = new Date(sub.trial_ends_at)
        const daysUntilTrial = Math.ceil(
          (trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilTrial > 0 && daysUntilTrial <= 30) {
          expected30Days += (daysUntilTrial / 30) * monthlyValue
        }
      }
    }
  }

  const arr = mrr * 12

  const forecast: { month: string; revenue: number }[] = []
  let forecastMrr = mrr

  for (let i = 0; i < 6; i++) {
    const futureDate = new Date(now)
    futureDate.setMonth(futureDate.getMonth() + i)
    const monthName = futureDate.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    })

    const expiringInMonth = expiringSoon.filter((e) => {
      const expMonth = e.expiresAt.getMonth()
      const expYear = e.expiresAt.getFullYear()
      return (
        expMonth === futureDate.getMonth() &&
        expYear === futureDate.getFullYear()
      )
    })

    for (const exp of expiringInMonth) {
      forecastMrr -= exp.monthlyValue
    }

    forecast.push({
      month: monthName,
      revenue: Math.max(0, forecastMrr),
    })
  }

  return {
    mrr,
    arr,
    expected30Days,
    forecast,
    activeSubscriptions: activeCount,
    trialSubscriptions: trialCount,
  }
}
