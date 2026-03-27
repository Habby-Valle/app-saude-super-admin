import { z } from "zod"

export const shiftStatusSchema = z.enum(
  ["in_progress", "completed", "cancelled"],
  {
    message: "Status inválido",
  }
)

export const createShiftSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),
  caregiver_id: z.string().uuid("Cuidador inválido"),
  started_at: z.string().min(1, "Data de início obrigatória"),
})

export const updateShiftSchema = z.object({
  id: z.string().uuid("ID do turno inválido"),
  status: shiftStatusSchema,
  ended_at: z.string().optional(),
})

export const shiftFiltersSchema = z.object({
  search: z.string().optional().default(""),
  status: z
    .enum(["all", "in_progress", "completed", "cancelled"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export type CreateShiftInput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>
export type ShiftFilters = z.infer<typeof shiftFiltersSchema>
export type ShiftStatus = z.infer<typeof shiftStatusSchema>
