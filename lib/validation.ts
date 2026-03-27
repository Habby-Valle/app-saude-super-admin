import { ZodError, ZodSchema } from "zod"
import { sanitizeString } from "./sanitize"

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}

export function parseWithSanitize<T>(
  schema: ZodSchema<T>,
  data: unknown,
  sanitizeFields?: (keyof T)[]
): ValidationResult<T> {
  try {
    let processedData = data

    if (sanitizeFields && typeof data === "object" && data !== null) {
      const sanitized: Record<string, unknown> = { ...(data as object) }

      sanitizeFields.forEach((field) => {
        if (
          field in sanitized &&
          typeof sanitized[field as string] === "string"
        ) {
          sanitized[field as string] = sanitizeString(
            sanitized[field as string]
          )
        }
      })

      processedData = sanitized
    }

    const result = schema.safeParse(processedData)

    if (result.success) {
      return { success: true, data: result.data }
    }

    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || "Erro de validação",
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError?.message || "Erro de validação",
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export function parseWithDefault<T>(
  schema: ZodSchema<T>,
  data: unknown,
  defaults?: Partial<T>
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data)

    if (result.success) {
      return {
        success: true,
        data: { ...defaults, ...result.data } as T,
      }
    }

    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || "Erro de validação",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUuid(id: unknown): boolean {
  if (typeof id !== "string") return false
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function validateCnpj(cnpj: unknown): boolean {
  if (typeof cnpj !== "string") return false
  const digits = cnpj.replace(/\D/g, "")
  if (digits.length !== 14) return false
  if (/^(\d)\1+$/.test(digits)) return false

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
  return d1 === parseInt(digits[12]) && d2 === parseInt(digits[13])
}

export function validateCpf(cpf: unknown): boolean {
  if (typeof cpf !== "string") return false
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder > 9) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder > 9) remainder = 0
  return remainder === parseInt(digits[10])
}

export function validatePhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10 && digits.length <= 11
}
