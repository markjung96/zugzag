import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CrewService } from "@/lib/services/crew.service"
import { UpdateCrewDto } from "@/lib/dto/crew.dto"
import { handleError, UnauthorizedError } from "@/lib/errors/app-error"
import { validateUUID } from "@/lib/utils/validate-uuid"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * 크루 조회 API
 * GET /api/crews/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const crew = await service.getCrew(crewId, session.user.id)

    return NextResponse.json(crew)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 크루 수정 API
 * PUT /api/crews/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Vercel Guideline: 모든 API route 첫 줄에 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id: crewId } = await params
    validateUUID(crewId, "크루 ID")

    // Request body parsing
    const body = await request.json()

    // DTO validation
    const data = UpdateCrewDto.parse(body)

    // Business logic (Service Layer)
    const service = new CrewService()
    const crew = await service.updateCrew(crewId, session.user.id, data)

    return NextResponse.json(crew)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 크루 삭제 API
 * DELETE /api/crews/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    await service.deleteCrew(crewId, session.user.id)

    return NextResponse.json({ message: "크루가 삭제되었습니다" })
  } catch (error) {
    return handleError(error)
  }
}
