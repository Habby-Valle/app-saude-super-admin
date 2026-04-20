import { createServerSupabaseClient } from "@/lib/supabase-server"

export interface SystemSettings {
  maintenance_mode: boolean
  maintenance_message: string | null
  maintenance_planned_end: string | null
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("system_settings")
    .select("maintenance_mode, maintenance_message, maintenance_planned_end")
    .maybeSingle()

  if (error || !data) {
    return {
      maintenance_mode: false,
      maintenance_message: null,
      maintenance_planned_end: null,
    }
  }

  return {
    maintenance_mode: data.maintenance_mode ?? false,
    maintenance_message: data.maintenance_message,
    maintenance_planned_end: data.maintenance_planned_end,
  }
}

export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await getSystemSettings()
  return settings.maintenance_mode
}

export async function checkMaintenanceAccess(
  userRole: string | null
): Promise<boolean> {
  if (userRole === "super_admin") {
    return false
  }

  return await isMaintenanceMode()
}
