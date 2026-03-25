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
      clinic:clinics(name),
      caregiver_patient(count)
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

  const patients: PatientWithDetails[] = (data ?? []).map((p) => ({
    ...p,
    clinic_name: (p.clinic as { name: string } | null)?.name ?? "—",
    caregiver_count: (p.caregiver_patient as unknown[] | null)?.length ?? 0,
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
