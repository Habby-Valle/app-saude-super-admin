"use server"

import { requireSuperAdmin } from "@/lib/auth"
import type { AuditLog } from "@/types/database"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "invite"
  | "activate"
  | "deactivate"
  | "update_logo"
  | "resend_invite"
  | "extend_trial"
  | "update_dates"
  | "change_plan"
  | "payment_failed"
  | "payment_failed_blocked"

export type AuditEntity =
  | "clinic"
  | "user"
  | "patient"
  | "checklist"
  | "shift"
  | "system"
  | "plan"
  | "plan_benefit"
  | "subscription"

export interface AuditLogWithUser extends AuditLog {
  user_name: string
  user_email: string
}

export interface AuditLogsResult {
  logs: AuditLogWithUser[]
  total: number
}

export interface AuditLogsFilters {
  action?: AuditAction | "all"
  entity?: AuditEntity | "all"
  userId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export async function getAuditLogs(
  filters: AuditLogsFilters
): Promise<AuditLogsResult> {
  const { supabase } = await requireSuperAdmin()

  const {
    action = "all",
    entity = "all",
    userId,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
  } = filters

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("audit_logs")
    .select(
      `
      *,
      user:users!user_id(name, email)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (action !== "all") {
    query = query.eq("action", action)
  }

  if (entity !== "all") {
    query = query.eq("entity", entity)
  }

  if (userId && userId !== "all") {
    query = query.eq("user_id", userId)
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom)
  }

  if (dateTo) {
    const endOfDay = new Date(dateTo)
    endOfDay.setHours(23, 59, 59, 999)
    query = query.lte("created_at", endOfDay.toISOString())
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getAuditLogs] Supabase error:", error)
    throw new Error(error.message)
  }

  const logs: AuditLogWithUser[] = (data ?? []).map((log) => ({
    ...log,
    user_name: (log.user as { name: string } | null)?.name ?? "—",
    user_email: (log.user as { email: string } | null)?.email ?? "—",
  }))

  return { logs, total: count ?? 0 }
}

export async function getAuditLogStats(): Promise<{
  total: number
  today: number
  byAction: Record<string, number>
}> {
  const { supabase } = await requireSuperAdmin()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ count: total }, { count: todayCount }, { data: recentLogs }] =
    await Promise.all([
      supabase.from("audit_logs").select("*", { count: "exact", head: true }),
      supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      supabase
        .from("audit_logs")
        .select("action")
        .order("created_at", { ascending: false })
        .limit(100),
    ])

  const byAction: Record<string, number> = {}
  for (const log of recentLogs ?? []) {
    byAction[log.action] = (byAction[log.action] ?? 0) + 1
  }

  return {
    total: total ?? 0,
    today: todayCount ?? 0,
    byAction,
  }
}

export async function getUsersForAuditFilter(): Promise<
  { id: string; name: string; email: string }[]
> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email")
    .order("name")

  if (error) {
    console.error("[getUsersForAuditFilter] Supabase error:", error)
    return []
  }

  return data ?? []
}

export async function logAuditEvent(
  action: AuditAction,
  entity: AuditEntity,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { supabase } = await requireSuperAdmin()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    entity,
    entity_id: entityId,
    metadata: metadata ?? null,
  })
}

export async function exportAuditLogsCsv(
  filters: AuditLogsFilters
): Promise<string> {
  const { logs } = await getAuditLogs({ ...filters, pageSize: 10000, page: 1 })

  const headers = [
    "Data/Hora",
    "Usuário",
    "Email",
    "Ação",
    "Entidade",
    "ID da Entidade",
  ]
  const rows = logs.map((log) => [
    new Date(log.created_at).toLocaleString("pt-BR"),
    log.user_name,
    log.user_email,
    log.action,
    log.entity,
    log.entity_id ?? "—",
  ])

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n")
}
