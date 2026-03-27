export type RateLimitTier = "strict" | "normal" | "relaxed"

interface RateLimitConfig {
  limit: number
  windowSeconds: number
}

const RATE_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  strict: { limit: 5, windowSeconds: 60 },
  normal: { limit: 20, windowSeconds: 60 },
  relaxed: { limit: 100, windowSeconds: 60 },
}

interface RateLimitResult {
  success: boolean
  remaining: number
  limit: number
  resetAt: Date
  error?: string
}

class RateLimitError extends Error {
  remaining: number
  resetAt: Date

  constructor(message: string, remaining: number, resetAt: Date) {
    super(message)
    this.name = "RateLimitError"
    this.remaining = remaining
    this.resetAt = resetAt
  }
}

function getRateLimitKey(action: string, userId?: string): string {
  const identifier = userId || "anonymous"
  return `${action}:${identifier}`
}

export async function checkRateLimit(
  action: string,
  tier: RateLimitTier = "normal",
  userId?: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[tier]
  const key = getRateLimitKey(action, userId)

  try {
    const response = await fetch("/api/rate-limit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        limit: config.limit,
        windowSeconds: config.windowSeconds,
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        remaining: 0,
        limit: config.limit,
        resetAt: new Date(Date.now() + config.windowSeconds * 1000),
        error: "Rate limit check failed",
      }
    }

    const data = await response.json()

    return {
      success: data.allowed,
      remaining: data.remaining,
      limit: data.limit,
      resetAt: new Date(data.reset_at),
    }
  } catch (error) {
    console.error("[RateLimit] Check failed:", error)
    return {
      success: true,
      remaining: config.limit,
      limit: config.limit,
      resetAt: new Date(Date.now() + config.windowSeconds * 1000),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function withRateLimit<T>(
  action: string,
  tier: RateLimitTier,
  userId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const result = await checkRateLimit(action, tier, userId)

  if (!result.success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)} seconds.`,
      result.remaining,
      result.resetAt
    )
  }

  return fn()
}

export function getRetryAfter(error: RateLimitError): number {
  return Math.ceil((error.resetAt.getTime() - Date.now()) / 1000)
}

export function formatRateLimitError(error: RateLimitError): string {
  const seconds = getRetryAfter(error)
  if (seconds <= 0) return "Tente novamente."
  if (seconds < 60)
    return `Tente novamente em ${seconds} segundo${seconds !== 1 ? "s" : ""}.`
  const minutes = Math.ceil(seconds / 60)
  return `Tente novamente em ${minutes} minuto${minutes !== 1 ? "s" : ""}.`
}

export { RateLimitError }
export type { RateLimitConfig, RateLimitResult }
