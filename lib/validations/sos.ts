import { z } from "zod"

export const sosStatusSchema = z.enum(["active", "acknowledged", "resolved"], {
  message: "Status SOS inválido",
})

export const createSosAlertSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),
  notes: z.string().max(1000).optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
})

export const acknowledgeSosAlertSchema = z.object({
  id: z.string().uuid("ID do alerta inválido"),
})

export const resolveSosAlertSchema = z.object({
  id: z.string().uuid("ID do alerta inválido"),
  resolution_notes: z.string().max(1000).optional(),
})

export const sosFiltersSchema = z.object({
  status: z
    .enum(["all", "active", "acknowledged", "resolved"])
    .optional()
    .default("all"),
  clinicId: z.string().uuid("Clínica inválida").optional().nullable(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export type CreateSosAlertInput = z.infer<typeof createSosAlertSchema>
export type AcknowledgeSosAlertInput = z.infer<typeof acknowledgeSosAlertSchema>
export type ResolveSosAlertInput = z.infer<typeof resolveSosAlertSchema>
export type SosFilters = z.infer<typeof sosFiltersSchema>
export type SosStatus = z.infer<typeof sosStatusSchema>
