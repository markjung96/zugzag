import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { crews, crewMembers, users } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import {
  handleError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "@/lib/errors/app-error"

type RouteContext = {
  params: Promise<{ id: string; memberId: string }>
}

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
})

/**
 * 크루 멤버 삭제 API (크루장만)
 * DELETE /api/crews/:id/members/:memberId
 * memberId = userId (멤버 목록 API의 id 필드와 동일)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id: crewId, memberId: targetUserId } = await context.params
    const userId = session.user.id

    // 크루 조회 및 크루장 확인
    const crew = await db
      .select()
      .from(crews)
      .where(eq(crews.id, crewId))
      .limit(1)

    if (crew.length === 0) {
      throw new NotFoundError("크루를 찾을 수 없습니다")
    }

    if (crew[0].leaderId !== userId) {
      throw new ForbiddenError("크루장만 멤버를 내보낼 수 있습니다")
    }

    // 멤버십 조회 (memberId = userId, crew_id + user_id 조합으로 조회)
    const membership = await db
      .select()
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetUserId)))
      .limit(1)

    if (membership.length === 0) {
      throw new NotFoundError("멤버를 찾을 수 없습니다")
    }

    // 크루장 본인은 내보낼 수 없음
    if (targetUserId === userId) {
      throw new BadRequestError("크루장은 내보낼 수 없습니다")
    }

    // 멤버 삭제
    await db
      .delete(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetUserId)))

    return NextResponse.json({ message: "멤버가 강제 퇴장되었습니다" })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 멤버 역할 변경 API (크루장만)
 * PATCH /api/crews/:id/members/:memberId
 * memberId = userId (멤버 목록 API의 id 필드와 동일)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id: crewId, memberId: targetUserId } = await context.params
    const userId = session.user.id

    // 요청 body 파싱 및 검증
    const body = await request.json()
    const parsed = updateRoleSchema.safeParse(body)
    if (!parsed.success) {
      throw new BadRequestError("유효하지 않은 역할입니다")
    }

    const { role: newRole } = parsed.data

    // 크루 조회 및 크루장 확인
    const crew = await db
      .select()
      .from(crews)
      .where(eq(crews.id, crewId))
      .limit(1)

    if (crew.length === 0) {
      throw new NotFoundError("크루를 찾을 수 없습니다")
    }

    if (crew[0].leaderId !== userId) {
      throw new ForbiddenError("크루장만 역할을 변경할 수 있습니다")
    }

    // 멤버십 조회 (memberId = userId, crew_id + user_id 조합으로 조회)
    const membership = await db
      .select({
        id: crewMembers.id,
        userId: crewMembers.userId,
        role: crewMembers.role,
      })
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetUserId)))
      .limit(1)

    if (membership.length === 0) {
      throw new NotFoundError("멤버를 찾을 수 없습니다")
    }

    // 크루장 역할은 변경 불가
    if (membership[0].role === "leader") {
      throw new BadRequestError("크루장의 역할은 변경할 수 없습니다")
    }

    // 역할 변경
    await db
      .update(crewMembers)
      .set({ role: newRole })
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetUserId)))

    // 멤버 정보 조회
    const user = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1)

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      name: user[0]?.name,
      role: newRole,
      message: "역할이 변경되었습니다",
    })
  } catch (error) {
    return handleError(error)
  }
}
