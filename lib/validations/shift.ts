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
  template_id: z.string().uuid("Template inválido").optional(),
  instructions: z.string().max(1000).optional(),
})

export const finishShiftSchema = z.object({
  id: z.string().uuid("ID do turno inválido"),
  justifications: z
    .array(
      z.object({
        checklist_id: z.string().uuid("ID do checklist inválido"),
        justification: z.string().min(1, "Justificativa obrigatória").max(500),
      })
    )
    .optional()
    .default([]),
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

export const createShiftTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  start_time: z
    .string()
    .min(1, "Horário de início obrigatório")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (use HH:MM)"),
  end_time: z
    .string()
    .min(1, "Horário de fim obrigatório")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (use HH:MM)"),
  instructions: z.string().max(1000, "Instruções muito longas").optional(),
})

export const updateShiftTemplateSchema = z.object({
  id: z.string().uuid("ID inválido"),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  start_time: z
    .string()
    .min(1, "Horário de início obrigatório")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (use HH:MM)"),
  end_time: z
    .string()
    .min(1, "Horário de fim obrigatório")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (use HH:MM)"),
  instructions: z.string().max(1000, "Instruções muito longas").optional(),
  is_active: z.boolean(),
})

export type CreateShiftInput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>
export type ShiftFilters = z.infer<typeof shiftFiltersSchema>
export type ShiftStatus = z.infer<typeof shiftStatusSchema>
export type CreateShiftTemplateInput = z.infer<typeof createShiftTemplateSchema>
export type UpdateShiftTemplateInput = z.infer<typeof updateShiftTemplateSchema>
export type FinishShiftInput = z.infer<typeof finishShiftSchema>

export const createCheckpointSchema = z.object({
  shift_id: z.string().uuid("ID do turno inválido"),
  notes: z.string().max(500, "Notas muito longas").optional(),
})

export type CreateCheckpointInput = z.infer<typeof createCheckpointSchema>
