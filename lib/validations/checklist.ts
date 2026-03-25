import { z } from "zod"

export const checklistItemTypeSchema = z.enum(
  ["text", "boolean", "select", "number"],
  {
    message: "Tipo inválido",
  }
)

export const checklistItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório").max(200),
  type: checklistItemTypeSchema,
  required: z.boolean().default(false),
  has_observation: z.boolean().default(false),
  options: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        label: z.string().min(1, "Label é obrigatório"),
        value: z.string().min(1, "Valor é obrigatório"),
      })
    )
    .optional(),
})

export const checklistFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  icon: z.string().max(50).optional(),
  clinic_id: z.string().uuid().nullable().optional(),
  items: z.array(checklistItemSchema).min(1, "Adicione pelo menos 1 item"),
})

export type ChecklistItemType = z.infer<typeof checklistItemTypeSchema>
export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>
export type ChecklistFormValues = z.infer<typeof checklistFormSchema>

export const checklistFiltersSchema = z.object({
  search: z.string().optional(),
  scope: z.enum(["all", "global", "clinic"]).optional().default("all"),
  clinicId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export type ChecklistFilters = z.infer<typeof checklistFiltersSchema>
