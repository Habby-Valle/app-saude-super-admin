import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginSchema = z.infer<typeof loginSchema>
