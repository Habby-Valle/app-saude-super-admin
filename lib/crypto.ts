/**
 * Criptografia AES-256-GCM para dados sensíveis (LGPD)
 *
 * Usa o módulo nativo `crypto` do Node.js — sem dependências externas.
 * A chave é derivada via scrypt a partir de ENCRYPTION_KEY no .env.
 *
 * Formato do ciphertext: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // 96 bits — recomendado para GCM
const KEY_SALT = "app-saude-lgpd-v1" // salt fixo para derivação determinística

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY não definida. Configure esta variável de ambiente."
    )
  }
  // Deriva 32 bytes (256 bits) a partir da chave fornecida
  return scryptSync(raw, KEY_SALT, 32)
}

/**
 * Cifra uma string com AES-256-GCM.
 * Retorna "<iv>:<authTag>:<ciphertext>" em hexadecimal.
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":")
}

/**
 * Decifra um valor previamente cifrado por `encrypt()`.
 * Lança erro se a autenticação falhar (dado adulterado).
 */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(":")

  if (parts.length !== 3) {
    throw new Error("Formato de ciphertext inválido")
  }

  const iv = Buffer.from(parts[0], "hex")
  const authTag = Buffer.from(parts[1], "hex")
  const encrypted = Buffer.from(parts[2], "hex")

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return (
    decipher.update(encrypted).toString("utf8") +
    decipher.final("utf8")
  )
}

/**
 * Cifra se o valor não for nulo/vazio.
 */
export function encryptIfPresent(
  value: string | null | undefined
): string | null {
  if (!value) return value ?? null
  return encrypt(value)
}

/**
 * Decifra com fallback: se falhar (dado ainda não cifrado ou chave diferente),
 * retorna o valor original.
 */
export function decryptIfPresent(
  value: string | null | undefined
): string | null {
  if (!value) return value ?? null
  try {
    return decrypt(value)
  } catch {
    // Dado pode estar em texto plano (migração progressiva)
    return value
  }
}

/**
 * Verifica se um valor parece estar cifrado (formato iv:authTag:ciphertext).
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":")
  return parts.length === 3 && parts.every((p) => /^[0-9a-f]+$/i.test(p))
}
