"use server"

import { requireSuperAdmin } from "@/lib/auth"
import { patientFiltersSchema } from "@/lib/validations/patient"
import type { Patient } from "@/types/database"

export interface PatientWithDetails extends Patient {
  clinic_name: string
  caregiver_count: number
  shift_count: number
  last_shift_at: string | null
}

export interface PatientsResult {
  patients: PatientWithDetails[]
  total: number
}

export interface ClinicOption {
  id: string
  name: string
}

export async function getPatients(raw: {
  search?: string
  clinicId?: string
  page?: number
  pageSize?: number
}): Promise<PatientsResult> {
  const { supabase } = await requireSuperAdmin()

  const parsed = patientFiltersSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { search = "", clinicId, page = 1, pageSize = 10 } = parsed.data
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("patients")
    .select(
      `
      *,
      clinic:clinics(name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  if (clinicId && clinicId !== "all") {
    query = query.eq("clinic_id", clinicId)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getPatients] Supabase error:", error)
    throw new Error(error.message)
  }

  // Busca contagem de cuidadores em lote (evita N queries e o bug do caregiver_patient(count))
  const patientIds = (data ?? []).map((p) => p.id)
  const caregiverCounts: Record<string, number> = {}

  if (patientIds.length > 0) {
    const { data: links } = await supabase
      .from("caregiver_patient")
      .select("patient_id")
      .in("patient_id", patientIds)

    links?.forEach((link) => {
      caregiverCounts[link.patient_id] =
        (caregiverCounts[link.patient_id] || 0) + 1
    })
  }

  const patients: PatientWithDetails[] = (data ?? []).map((p) => ({
    ...p,
    clinic_name: (p.clinic as { name: string } | null)?.name ?? "—",
    caregiver_count: caregiverCounts[p.id] || 0,
    shift_count: 0,
    last_shift_at: null,
  }))

  return { patients, total: count ?? 0 }
}

export async function getClinicsForFilter(): Promise<ClinicOption[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("[getClinicsForFilter] Supabase error:", error)
    return []
  }

  return data ?? []
}

export async function getPatientCaregivers(
  patientId: string
): Promise<{ id: string; name: string; email: string }[]> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("caregiver_patient")
    .select(
      `
      caregiver:users!caregiver_id(id, name, email)
    `
    )
    .eq("patient_id", patientId)

  if (error) {
    console.error("[getPatientCaregivers] Supabase error:", error)
    return []
  }

  return (data ?? [])
    .map(
      (cp) =>
        cp.caregiver as unknown as {
          id: string
          name: string
          email: string
        } | null
    )
    .filter((c): c is { id: string; name: string; email: string } => c !== null)
}

export interface ExecutedChecklist {
  id: string
  status: string
  checklist_name: string
  started_at: string | null
  caregiver_name: string
}

export interface PatientDetails {
  patient: Patient
  clinic: { id: string; name: string } | null
  caregivers: { id: string; name: string; email: string }[]
  emergencyContacts: { id: string; name: string; phone: string }[]
  executedChecklists: ExecutedChecklist[]
  stats: {
    totalShifts: number
    totalChecklists: number
    lastShiftAt: string | null
  }
}

export async function getPatientById(
  id: string
): Promise<PatientDetails | null> {
  const { supabase } = await requireSuperAdmin()

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single()

  if (patientError || !patient) {
    console.error("[getPatientById] Patient not found:", patientError)
    return null
  }

  const [clinicResult, caregiversResult, shiftsResult] = await Promise.all([
    patient.clinic_id
      ? supabase
          .from("clinics")
          .select("id, name")
          .eq("id", patient.clinic_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("caregiver_patient")
      .select("caregiver:users!caregiver_id(id, name, email)")
      .eq("patient_id", id),
    supabase
      .from("shifts")
      .select("id, started_at", { count: "exact" })
      .eq("patient_id", id)
      .order("started_at", { ascending: false }),
  ])

  // Busca checklists executados via IDs dos turnos do paciente
  const shiftIds = (shiftsResult.data ?? []).map((s) => s.id)
  const lastShiftAt = shiftsResult.data?.[0]?.started_at ?? null

  let executedChecklists: ExecutedChecklist[] = []
  if (shiftIds.length > 0) {
    const { data: checklistData } = await supabase
      .from("shift_checklists")
      .select(
        `
        id,
        status,
        checklist:checklists!checklist_id(name),
        shift:shifts!shift_id(started_at, caregiver:users!caregiver_id(name))
      `
      )
      .in("shift_id", shiftIds)
      .order("id", { ascending: false })
      .limit(20)

    executedChecklists = (checklistData ?? []).map((sc) => {
      const checklist = (sc.checklist as { name: string }[] | null)?.[0]
      const shift = (
        sc.shift as
          | { started_at: string; caregiver: { name: string }[] | null }[]
          | null
      )?.[0]
      return {
        id: sc.id,
        status: sc.status,
        checklist_name: checklist?.name ?? "—",
        started_at: shift?.started_at ?? null,
        caregiver_name: shift?.caregiver?.[0]?.name ?? "—",
      }
    })
  }

  const caregivers = (caregiversResult.data ?? [])
    .map(
      (cp) =>
        cp.caregiver as unknown as {
          id: string
          name: string
          email: string
        } | null
    )
    .filter((c): c is { id: string; name: string; email: string } => c !== null)

  return {
    patient,
    clinic: clinicResult.data ?? null,
    caregivers,
    emergencyContacts: [],
    executedChecklists,
    stats: {
      totalShifts: shiftsResult.count ?? 0,
      totalChecklists: executedChecklists.length,
      lastShiftAt,
    },
  }
}

export async function exportPatientsCsv(): Promise<string> {
  const { patients } = await getPatients({ pageSize: 10000, page: 1 })

  const headers = ["Nome", "Clínica", "Cuidadores", "Nascimento", "Criado em"]
  const rows = patients.map((p) => [
    p.name,
    p.clinic_name,
    String(p.caregiver_count),
    p.birth_date,
    new Date(p.created_at).toLocaleDateString("pt-BR"),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

  return csv
}
