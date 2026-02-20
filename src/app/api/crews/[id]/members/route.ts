import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CrewService } from "@/lib/services/crew.service"
import { handleError, UnauthorizedError } from "@/lib/errors/app-error"
import { validateUUID } from "@/lib/utils/validate-uuid"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * 크루 멤버 목록 조회 API
 * GET /api/crews/[id]/members
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    // Vercel Guideline: 모든 API route 첫 줄에 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id: crewId } = await params
    validateUUID(crewId, "크루 ID")

    // Business logic (Service Layer)
    const service = new CrewService()
    const members = await service.getMembers(crewId, session.user.id)

    return NextResponse.json({ members })
  } catch (error) {
    return handleError(error)
  }
}
