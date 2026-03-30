/**
 * Utilitários LGPD — Exportação e Anonimização de dados
 *
 * Implementa os direitos do titular previstos na LGPD (Lei 13.709/2018):
 *  - Art. 18, IV: Portabilidade (exportação de dados)
 *  - Art. 18, VI: Eliminação / Anonimização
 */

import { createAdminClient } from "@/lib/supabase-admin"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UserDataExport {
  exported_at: string
  user: {
    id: string
    name: string
    email: string
    role: string
    status: string
    created_at: string
    last_sign_in_at: string | null
    clinic_id: string | null
  }
  audit_logs: {
    id: string
    action: string
    entity: string
    entity_id: string | null
    created_at: string
  }[]
  shifts: {
    id: string
    started_at: string | null
    ended_at: string | null
    status: string | null
    patient_name: string | null
  }[]
  sos_alerts_triggered: {
    id: string
    status: string
    created_at: string
    notes: string | null
  }[]
}

export interface PatientDataExport {
  exported_at: string
  patient: {
    id: string
    name: string
    birth_date: string | null
    clinic_name: string | null
    created_at: string
  }
  caregivers: {
    id: string
    name: string
    email: string
  }[]
  shifts: {
    id: string
    caregiver_name: string | null
    started_at: string | null
    ended_at: string | null
    status: string | null
  }[]
  sos_alerts: {
    id: string
    status: string
    triggered_by_name: string | null
    created_at: string
    notes: string | null
  }[]
}

export interface AnonymizeResult {
  success: boolean
  error?: string
}

// ─── Exportação de dados ──────────────────────────────────────────────────────

/**
 * Agrega todos os dados associados a um usuário para exportação LGPD.
 */
export async function exportUserData(
  userId: string
): Promise<UserDataExport | null> {
  const admin = createAdminClient()

  const { data: user, error: userError } = await admin
    .from("users")
    .select("id, name, email, role, status, created_at, clinic_id")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    console.error("[exportUserData] user not found:", userError)
    return null
  }

  // Recuperar last_sign_in_at do auth.users via admin
  const { data: authUser } = await admin.auth.admin.getUserById(userId)

  const [auditResult, shiftsResult, sosResult] = await Promise.all([
    admin
      .from("audit_logs")
      .select("id, action, entity, entity_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

    admin
      .from("shifts")
      .select("id, started_at, ended_at, status, patient:patients(name)")
      .eq("caregiver_id", userId)
      .order("started_at", { ascending: false }),

    admin
      .from("sos_alerts")
      .select("id, status, created_at, notes")
      .eq("triggered_by", userId)
      .order("created_at", { ascending: false }),
  ])

  const shifts = (shiftsResult.data ?? []).map((s) => ({
    id: s.id,
    started_at: s.started_at,
    ended_at: s.ended_at,
    status: s.status,
    patient_name: (s.patient as { name: string }[] | null)?.[0]?.name ?? null,
  }))

  return {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      last_sign_in_at: authUser?.user?.last_sign_in_at ?? null,
      clinic_id: user.clinic_id,
    },
    audit_logs: auditResult.data ?? [],
    shifts,
    sos_alerts_triggered: sosResult.data ?? [],
  }
}

/**
 * Agrega todos os dados associados a um paciente para exportação LGPD.
 */
export async function exportPatientData(
  patientId: string
): Promise<PatientDataExport | null> {
  const admin = createAdminClient()

  const { data: patient, error: patientError } = await admin
    .from("patients")
    .select("id, name, birth_date, created_at, clinic:clinics(name)")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    console.error("[exportPatientData] patient not found:", patientError)
    return null
  }

  const [caregiversResult, shiftsResult, sosResult] = await Promise.all([
    admin
      .from("caregiver_patient")
      .select("caregiver:users(id, name, email)")
      .eq("patient_id", patientId),

    admin
      .from("shifts")
      .select("id, started_at, ended_at, status, caregiver:users(name)")
      .eq("patient_id", patientId)
      .order("started_at", { ascending: false }),

    admin
      .from("sos_alerts")
      .select("id, status, created_at, notes, triggered_by_user:users(name)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
  ])

  const caregivers = (caregiversResult.data ?? []).map((cp) => {
    const u = cp.caregiver as
      | { id: string; name: string; email: string }[]
      | null
    return {
      id: u?.[0]?.id ?? "",
      name: u?.[0]?.name ?? "",
      email: u?.[0]?.email ?? "",
    }
  })

  const shifts = (shiftsResult.data ?? []).map((s) => ({
    id: s.id,
    started_at: s.started_at,
    ended_at: s.ended_at,
    status: s.status,
    caregiver_name:
      (s.caregiver as { name: string }[] | null)?.[0]?.name ?? null,
  }))

  const sos = (sosResult.data ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    created_at: a.created_at,
    notes: a.notes,
    triggered_by_name:
      (a.triggered_by_user as { name: string }[] | null)?.[0]?.name ?? null,
  }))

  return {
    exported_at: new Date().toISOString(),
    patient: {
      id: patient.id,
      name: patient.name,
      birth_date: patient.birth_date,
      clinic_name:
        (patient.clinic as { name: string }[] | null)?.[0]?.name ?? null,
      created_at: patient.created_at,
    },
    caregivers,
    shifts,
    sos_alerts: sos,
  }
}

// ─── Anonimização ─────────────────────────────────────────────────────────────

/**
 * Anonimiza os dados pessoais de um usuário (direito ao esquecimento — LGPD Art. 18, VI).
 * Substitui PII por valores genéricos e registra a data de anonimização.
 *
 * Não deleta o registro pois referências (audit_logs, shifts) podem ser exigidas
 * por obrigação legal.
 */
export async function anonymizeUser(userId: string): Promise<AnonymizeResult> {
  const admin = createAdminClient()

  // Verifica que não é super_admin
  const { data: user, error: fetchError } = await admin
    .from("users")
    .select("id, role")
    .eq("id", userId)
    .single()

  if (fetchError || !user) {
    return { success: false, error: "Usuário não encontrado" }
  }

  if (user.role === "super_admin") {
    return {
      success: false,
      error: "Não é possível anonimizar um Super Admin",
    }
  }

  const anonymizedName = `Usuário Anonimizado ${userId.slice(0, 8)}`
  const anonymizedEmail = `anonimizado_${userId.slice(0, 8)}@removido.local`

  const { error: updateError } = await admin
    .from("users")
    .update({
      name: anonymizedName,
      email: anonymizedEmail,
      status: "blocked",
    })
    .eq("id", userId)

  if (updateError) {
    console.error("[anonymizeUser]", updateError)
    return { success: false, error: updateError.message }
  }

  // Desabilita login no Supabase Auth
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "876600h", // ~100 anos
    email: anonymizedEmail,
  })

  if (authError) {
    console.error("[anonymizeUser] auth update error:", authError)
    // Não bloqueia — o perfil já foi anonimizado
  }

  return { success: true }
}

/**
 * Anonimiza os dados pessoais de um paciente.
 */
export async function anonymizePatient(
  patientId: string
): Promise<AnonymizeResult> {
  const admin = createAdminClient()

  const { data: patient, error: fetchError } = await admin
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single()

  if (fetchError || !patient) {
    return { success: false, error: "Paciente não encontrado" }
  }

  const anonymizedName = `Paciente Anonimizado ${patientId.slice(0, 8)}`

  const { error: updateError } = await admin
    .from("patients")
    .update({
      name: anonymizedName,
      birth_date: null,
    })
    .eq("id", patientId)

  if (updateError) {
    console.error("[anonymizePatient]", updateError)
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
