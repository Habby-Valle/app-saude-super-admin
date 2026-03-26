import { z } from "zod"

export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  clinicId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export type PatientFilters = z.infer<typeof patientFiltersSchema>

export const patientSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  birth_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Data de nascimento inválida (use YYYY-MM-DD)"
    ),
  caregiver_ids: z.array(z.string()).optional().default([]),
})

export type PatientFormValues = z.infer<typeof patientSchema>
