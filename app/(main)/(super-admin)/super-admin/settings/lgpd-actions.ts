"use server"

import { requireSuperAdmin } from "@/lib/auth"
import {
  exportUserData,
  exportPatientData,
  anonymizeUser,
  anonymizePatient,
} from "@/lib/lgpd"
import { isEncrypted } from "@/lib/crypto"
import { createAdminClient } from "@/lib/supabase-admin"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RetentionPolicy {
  entity: string
  label: string
  retention_days: number
  description: string
}

export interface EncryptionStatus {
  field: string
  table: string
  label: string
  encrypted: boolean
  sample_checked: boolean
}

export interface LgpdConfig {
  retention_policies: RetentionPolicy[]
  encryption_key_configured: boolean
  encryption_statuses: EncryptionStatus[]
}

// Políticas de retenção padrão (configuráveis via UI)
// TODO: Persistir no banco quando a tabela data_retention_policies existir
const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    entity: "audit_logs",
    label: "Logs de Auditoria",
    retention_days: 365,
    description: "Registros de ações de administradores",
  },
  {
    entity: "sos_alerts",
    label: "Alertas SOS",
    retention_days: 730,
    description: "Alertas de emergência e localizações",
  },
  {
    entity: "shifts",
    label: "Histórico de Turnos",
    retention_days: 1825,
    description: "Registros de turnos dos cuidadores",
  },
  {
    entity: "patients",
    label: "Dados de Pacientes",
    retention_days: 3650,
    description: "Prontuários e dados dos pacientes",
  },
]

let runtimePolicies = [...DEFAULT_RETENTION_POLICIES]

// ─── Configuração LGPD ────────────────────────────────────────────────────────

export async function getLgpdConfig(): Promise<LgpdConfig> {
  await requireSuperAdmin()

  const encryptionKeyConfigured = !!process.env.ENCRYPTION_KEY

  // Verifica na amostra se os campos sensíveis já estão cifrados
  const admin = createAdminClient()
  const encryptionStatuses: EncryptionStatus[] = []

  const { data: sosAlert } = await admin
    .from("sos_alerts")
    .select("notes")
    .not("notes", "is", null)
    .limit(1)
    .maybeSingle()

  encryptionStatuses.push({
    field: "notes",
    table: "sos_alerts",
    label: "Observações em Alertas SOS",
    encrypted: sosAlert?.notes ? isEncrypted(sosAlert.notes) : false,
    sample_checked: !!sosAlert,
  })

  return {
    retention_policies: runtimePolicies,
    encryption_key_configured: encryptionKeyConfigured,
    encryption_statuses: encryptionStatuses,
  }
}

export async function updateRetentionPolicy(
  entity: string,
  retention_days: number
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()

  if (retention_days < 1) {
    return { success: false, error: "Período mínimo é 1 dia" }
  }

  runtimePolicies = runtimePolicies.map((p) =>
    p.entity === entity ? { ...p, retention_days } : p
  )

  // TODO: Persistir quando a tabela data_retention_policies existir:
  // const { supabase } = await requireSuperAdmin()
  // await supabase.from("data_retention_policies").upsert({ entity, retention_days })

  return { success: true }
}

// ─── Exportação de dados (Portabilidade — LGPD Art. 18, IV) ──────────────────

export async function exportUserDataAction(
  userId: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  await requireSuperAdmin()

  if (!userId?.trim()) {
    return { success: false, error: "ID do usuário é obrigatório" }
  }

  const data = await exportUserData(userId)

  if (!data) {
    return { success: false, error: "Usuário não encontrado" }
  }

  return { success: true, data: JSON.stringify(data, null, 2) }
}

export async function exportPatientDataAction(
  patientId: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  await requireSuperAdmin()

  if (!patientId?.trim()) {
    return { success: false, error: "ID do paciente é obrigatório" }
  }

  const data = await exportPatientData(patientId)

  if (!data) {
    return { success: false, error: "Paciente não encontrado" }
  }

  return { success: true, data: JSON.stringify(data, null, 2) }
}

// ─── Anonimização (Direito ao Esquecimento — LGPD Art. 18, VI) ───────────────

export async function anonymizeUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()

  if (!userId?.trim()) {
    return { success: false, error: "ID do usuário é obrigatório" }
  }

  return anonymizeUser(userId)
}

export async function anonymizePatientAction(
  patientId: string
): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()

  if (!patientId?.trim()) {
    return { success: false, error: "ID do paciente é obrigatório" }
  }

  return anonymizePatient(patientId)
}

// ─── Busca de usuários/pacientes para o formulário ───────────────────────────

export async function searchUsersForLgpd(
  query: string
): Promise<{ id: string; name: string; email: string; role: string }[]> {
  await requireSuperAdmin()

  if (!query.trim()) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from("users")
    .select("id, name, email, role")
    .neq("role", "super_admin")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(5)

  return data ?? []
}

export async function searchPatientsForLgpd(
  query: string
): Promise<{ id: string; name: string; clinic_name: string }[]> {
  await requireSuperAdmin()

  if (!query.trim()) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from("patients")
    .select("id, name, clinic:clinics(name)")
    .ilike("name", `%${query}%`)
    .limit(5)

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    clinic_name: (p.clinic as { name: string }[] | null)?.[0]?.name ?? "—",
  }))
}
