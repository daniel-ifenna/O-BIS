import { NextRequest, NextResponse } from "next/server"

type RateLimitStore = Map<string, { count: number; reset: number }>

const store: RateLimitStore = new Map()

interface RateLimitConfig {
  limit: number
  windowMs: number
}

/**
 * Basic in-memory rate limiter.
 * Note: In a serverless environment (Vercel), this is per-lambda and not shared.
 * For strict global rate limiting, use Redis (e.g., Upstash).
 */
export function rateLimit(ip: string, config: RateLimitConfig = { limit: 20, windowMs: 60 * 1000 }) {
  const now = Date.now()
  const record = store.get(ip)

  if (!record) {
    store.set(ip, { count: 1, reset: now + config.windowMs })
    return { success: true, remaining: config.limit - 1 }
  }

  if (now > record.reset) {
    store.set(ip, { count: 1, reset: now + config.windowMs })
    return { success: true, remaining: config.limit - 1 }
  }

  if (record.count >= config.limit) {
    return { success: false, remaining: 0, reset: record.reset }
  }

  record.count += 1
  return { success: true, remaining: config.limit - record.count }
}

export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (req: NextRequest, ...args: any[]) => {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const result = rateLimit(ip, config)

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((result.reset! - Date.now()) / 1000)) } }
      )
    }

    return handler(req, ...args)
  }
}
