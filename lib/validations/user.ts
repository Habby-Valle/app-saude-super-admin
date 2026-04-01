import { z } from "zod"

export const userFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").optional(),
  role: z.enum(["clinic_admin", "caregiver", "family"], {
    message: "Perfil é obrigatório",
  }),
  clinic_id: z.string().uuid("Clínica inválida").nullable(),
})

export const inviteUserSchema = userFormSchema.extend({
  email: z.string().email("Email inválido"),
})
export const updateUserSchema = userFormSchema.omit({ email: true, role: true, clinic_id: true })

export type InviteUserValues = z.infer<typeof inviteUserSchema>
export type UpdateUserValues = z.infer<typeof updateUserSchema>
export type UserFormValues = z.infer<typeof userFormSchema>
