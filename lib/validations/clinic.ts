import { z } from 'zod'

// Valida CNPJ pelo algoritmo oficial (dígitos verificadores)
function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1+$/.test(digits)) return false // todos iguais

  const calc = (d: string, len: number) => {
    let sum = 0
    let pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(d[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const d1 = calc(digits, 12)
  const d2 = calc(digits, 13)
  return (
    d1 === parseInt(digits[12]) && d2 === parseInt(digits[13])
  )
}

export const clinicSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .transform((v) => v.replace(/\D/g, ''))
    .refine(isValidCnpj, 'CNPJ inválido'),
  status: z.enum(['active', 'inactive', 'suspended'], {
    required_error: 'Status é obrigatório',
  }),
  plan: z.string().max(50).optional(),
})

export type ClinicFormValues = z.infer<typeof clinicSchema>
