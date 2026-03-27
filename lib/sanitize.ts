const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<[^>]+>/g,
]

const DANGEROUS_CHARS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
}

export function sanitizeString(input: unknown): string {
  if (input === null || input === undefined) {
    return ""
  }

  let str = String(input)

  DANGEROUS_PATTERNS.forEach((pattern) => {
    str = str.replace(pattern, "")
  })

  Object.entries(DANGEROUS_CHARS).forEach(([char, escaped]) => {
    str = str.split(char).join(escaped)
  })

  return str.trim()
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj }
  fields.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeString(sanitized[field]) as T[keyof T]
    }
  })
  return sanitized
}

export function isSafeInput(input: unknown): boolean {
  if (typeof input !== "string") {
    return true
  }

  const lower = input.toLowerCase()
  if (lower.includes("script") || lower.includes("iframe")) {
    return false
  }

  if (
    /^https?:\/\/[^\s]+$/i.test(input) === false &&
    /^[a-zA-Z0-9\s@.\-_]+$/.test(input) === false
  ) {
    return false
  }

  return true
}

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) {
    return ""
  }
  return String(input)
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;")
    .split("'")
    .join("&#x27;")
}

export function stripHtml(input: unknown): string {
  if (input === null || input === undefined) {
    return ""
  }
  return String(input)
    .replace(/<[^>]*>/g, "")
    .trim()
}

export function truncate(input: unknown, maxLength: number): string {
  if (input === null || input === undefined) {
    return ""
  }
  const str = String(input)
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - 3) + "..."
}
