import { z } from "zod"

export const planSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(500, "Descrição muito longa"),
  price: z
    .number()
    .min(0, "Preço não pode ser negativo")
    .max(99999.99, "Preço muito alto"),
  billing_cycle: z.enum(["monthly", "quarterly", "annual"], {
    message: "Ciclo de cobrança é obrigatório",
  }),
  is_active: z.boolean(),
  features: z.array(z.string()),
  max_users: z
    .number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 usuário"),
  max_patients: z
    .number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 paciente"),
  max_storage: z
    .number()
    .int("Deve ser um número inteiro")
    .min(0, "Mínimo 0 GB"),
  sort_order: z.number().int(),
})

export type PlanFormValues = z.infer<typeof planSchema>

export const planBenefitSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  code: z
    .string()
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(50, "Código muito longo")
    .regex(
      /^[a-z0-9_-]+$/,
      "Código deve conter apenas letras minúsculas, números, _ e -"
    ),
  category: z.enum(["feature", "limit", "addon", "integration"], {
    message: "Categoria é obrigatória",
  }),
  icon: z.string().max(50).default("Star"),
  is_active: z.boolean(),
})

export type PlanBenefitFormValues = z.infer<typeof planBenefitSchema>
