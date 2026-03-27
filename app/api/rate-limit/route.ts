import { NextRequest, NextResponse } from "next/server"

const store = new Map<string, { count: number; resetAt: number }>()

setInterval(
  () => {
    const now = Date.now()
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) {
        store.delete(key)
      }
    }
  },
  5 * 60 * 1000
)

interface RateLimitRequest {
  key: string
  limit: number
  windowSeconds: number
}

export async function POST(request: NextRequest) {
  try {
    const body: RateLimitRequest = await request.json()

    if (!body.key || !body.limit || !body.windowSeconds) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { key, limit, windowSeconds } = body
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
      return NextResponse.json({
        allowed: true,
        remaining: limit - 1,
        limit,
        reset_at: new Date(now + windowSeconds * 1000).toISOString(),
      })
    }

    if (entry.count >= limit) {
      return NextResponse.json(
        {
          allowed: false,
          remaining: 0,
          limit,
          reset_at: new Date(entry.resetAt).toISOString(),
        },
        { status: 429 }
      )
    }

    entry.count++

    return NextResponse.json({
      allowed: true,
      remaining: limit - entry.count,
      limit,
      reset_at: new Date(entry.resetAt).toISOString(),
    })
  } catch (error) {
    console.error("[RateLimit] Error:", error)
    return NextResponse.json(
      {
        allowed: true,
        remaining: 100,
        limit: 100,
        reset_at: new Date(Date.now() + 60000).toISOString(),
      },
      { status: 200 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
