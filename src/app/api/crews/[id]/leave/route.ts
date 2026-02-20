import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import {
  crewMembers,
  schedules,
  scheduleRounds,
  rsvps,
} from "@/lib/db/schema"
import { eq, and, gte, inArray } from "drizzle-orm"
import {
  handleError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "@/lib/errors/app-error"
import { validateUUID } from "@/lib/utils/validate-uuid"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * 크루 탈퇴 API
 * POST /api/crews/:id/leave
 *
 * 권한: 크루 멤버 (크루장 제외)
 * - 운영진(admin), 멤버(member)만 탈퇴 가능
 * - 크루장은 탈퇴 불가 (크루 삭제 또는 리더 위임 필요)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Vercel Guideline: 모든 API route 첫 줄에 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id: crewId } = await params
    validateUUID(crewId, "크루 ID")
    const userId = session.user.id

    // 1. crew_members에서 현재 유저의 멤버십 조회
    const membership = await db
      .select({
        id: crewMembers.id,
        role: crewMembers.role,
      })
      .from(crewMembers)
      .where(
        and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId))
      )
      .limit(1)

    // 멤버가 아니면 404
    if (membership.length === 0) {
      throw new NotFoundError("크루를 찾을 수 없거나 멤버가 아닙니다")
    }

    // 2. 역할이 'leader'이면 400 에러
    if (membership[0].role === "leader") {
      throw new BadRequestError(
        "크루장은 탈퇴할 수 없습니다. 크루를 삭제하거나 리더를 위임해주세요."
      )
    }

    // 3. 해당 크루의 미래 일정에 대한 RSVP 삭제 (권장)
    const today = new Date().toISOString().split("T")[0]
    const futureSchedules = await db
      .select({ id: schedules.id })
      .from(schedules)
      .where(
        and(eq(schedules.crewId, crewId), gte(schedules.date, today))
      )

    if (futureSchedules.length > 0) {
      const scheduleIds = futureSchedules.map((s) => s.id)
      const futureRounds = await db
        .select({ id: scheduleRounds.id })
        .from(scheduleRounds)
        .where(inArray(scheduleRounds.scheduleId, scheduleIds))

      if (futureRounds.length > 0) {
        const roundIds = futureRounds.map((r) => r.id)
        await db
          .delete(rsvps)
          .where(
            and(
              eq(rsvps.userId, userId),
              inArray(rsvps.roundId, roundIds)
            )
          )
      }
    }

    // 4. crew_members에서 해당 레코드 삭제
    await db
      .delete(crewMembers)
      .where(
        and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId))
      )

    return NextResponse.json({ message: "크루에서 탈퇴했습니다" })
  } catch (error) {
    return handleError(error)
  }
}
