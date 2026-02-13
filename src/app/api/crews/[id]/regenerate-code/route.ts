import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CrewService } from "@/lib/services/crew.service"
import { handleError, UnauthorizedError } from "@/lib/errors/app-error"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * 초대 코드 재생성 API
 * POST /api/crews/[id]/regenerate-code
 * 권한: 크루장
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Vercel Guideline: 모든 API route 첫 줄에 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id: crewId } = await params

    // Business logic (Service Layer)
    const service = new CrewService()
    const result = await service.regenerateInviteCode(crewId, session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
}
