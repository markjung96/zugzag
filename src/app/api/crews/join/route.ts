import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CrewService } from "@/lib/services/crew.service"
import { JoinCrewDto } from "@/lib/dto/crew.dto"
import { handleError, UnauthorizedError } from "@/lib/errors/app-error"

/**
 * 크루 가입 API (초대 코드)
 * POST /api/crews/join
 */
export async function POST(request: NextRequest) {
  try {
    // Vercel Guideline: 모든 API route 첫 줄에 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    // Request body parsing
    const body = await request.json()

    // DTO validation
    const data = JoinCrewDto.parse(body)

    // Business logic (Service Layer)
    const service = new CrewService()
    const crew = await service.joinCrew(session.user.id, data)

    return NextResponse.json(crew, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
