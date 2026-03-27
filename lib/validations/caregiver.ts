import { z } from "zod"

export const caregiverFiltersSchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export const createCaregiverSchema = z.object({
  name: z
    .string()
    .min(2, "Nome precisa ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
})

export const updateCaregiverSchema = z.object({
  id: z.string().uuid("ID do cuidador inválido"),
  name: z
    .string()
    .min(2, "Nome precisa ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
})

export type CaregiverFilters = z.infer<typeof caregiverFiltersSchema>
export type CreateCaregiverInput = z.infer<typeof createCaregiverSchema>
export type UpdateCaregiverInput = z.infer<typeof updateCaregiverSchema>
