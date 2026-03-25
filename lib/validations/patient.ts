import { z } from "zod"

export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  clinicId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export type PatientFilters = z.infer<typeof patientFiltersSchema>
