import { createServerSupabaseClient } from "@/lib/supabase-server"
import { appConfig } from "@/lib/env"

export interface SystemConfig {
  maintenance_mode: boolean
  maintenance_message: string | null
  maintenance_planned_end: string | null
  app_name: string | null
  app_url: string | null
  app_site_url: string | null
  app_store_url: string | null
  play_store_url: string | null
  support_email: string | null
  support_phone: string | null
  support_whatsapp: string | null
  admin_logo_url: string | null
  cnpj: string | null
  address: string | null
  timezone: string | null
  currency: string | null
}

export async function getSystemSettings(): Promise<SystemConfig> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .maybeSingle()

  if (error || !data) {
    return getDefaultSystemConfig()
  }

  return {
    maintenance_mode: data.maintenance_mode ?? false,
    maintenance_message: data.maintenance_message,
    maintenance_planned_end: data.maintenance_planned_end,
    app_name: data.app_name,
    app_url: data.app_url,
    app_site_url: data.app_site_url,
    app_store_url: data.app_store_url,
    play_store_url: data.play_store_url,
    support_email: data.support_email,
    support_phone: data.support_phone,
    support_whatsapp: data.support_whatsapp,
    admin_logo_url: data.admin_logo_url,
    cnpj: data.cnpj,
    address: data.address,
    timezone: data.timezone,
    currency: data.currency,
  }
}

function getDefaultSystemConfig(): SystemConfig {
  return {
    maintenance_mode: false,
    maintenance_message: null,
    maintenance_planned_end: null,
    app_name: appConfig.appName,
    app_url: appConfig.appUrl,
    app_site_url: null,
    app_store_url: null,
    play_store_url: null,
    support_email: null,
    support_phone: null,
    support_whatsapp: null,
    admin_logo_url: null,
    cnpj: null,
    address: null,
    timezone: "America/Sao_Paulo",
    currency: "BRL",
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
