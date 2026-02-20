import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CrewService } from "@/lib/services/crew.service"
import { CreateCrewDto } from "@/lib/dto/crew.dto"
import { handleError, UnauthorizedError } from "@/lib/errors/app-error"
import { mutationRateLimit } from "@/lib/rate-limit"
import { checkRateLimit } from "@/lib/utils/check-rate-limit"

/**
 * 사용자 크루 목록 조회 API
 * GET /api/crews
 */
export async function GET() {
  try {
    // Vercel Guideline: 모든 API route 첫 줄에 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    // Business logic (Service Layer)
    const service = new CrewService()
    const crews = await service.getUserCrews(session.user.id)

    return NextResponse.json({ crews })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 크루 생성 API
 * POST /api/crews
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, mutationRateLimit)
    if (rateLimitResponse) return rateLimitResponse

    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    // Request body parsing
    const body = await request.json()

    // DTO validation
    const data = CreateCrewDto.parse(body)

    // Business logic (Service Layer)
    const service = new CrewService()
    const crew = await service.createCrew(session.user.id, data)

    return NextResponse.json(crew, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
