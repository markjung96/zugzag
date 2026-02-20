import { NextRequest, NextResponse } from "next/server"
import type { Ratelimit } from "@upstash/ratelimit"

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  )
}

export async function checkRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null
): Promise<NextResponse | null> {
  // Rate limiter가 설정되지 않은 경우 (Redis 미연결) 통과
  if (!limiter) {
    return null
  }

  const ip = getClientIp(request)
  const { success } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요", code: "RATE_LIMITED" },
      { status: 429 }
    )
  }

  return null
}
