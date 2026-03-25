import { z } from 'zod'

export const inviteUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  role: z.enum(['clinic_admin', 'caregiver', 'family'], {
    required_error: 'Perfil é obrigatório',
  }),
  clinic_id: z.string().uuid('Clínica inválida').nullable(),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  role: z.enum(['clinic_admin', 'caregiver', 'family'], {
    required_error: 'Perfil é obrigatório',
  }),
  clinic_id: z.string().uuid('Clínica inválida').nullable(),
})

export type InviteUserValues = z.infer<typeof inviteUserSchema>
export type UpdateUserValues = z.infer<typeof updateUserSchema>
