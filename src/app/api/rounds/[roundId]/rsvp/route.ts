import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crewMembers, rsvps } from "@/lib/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from "@/lib/errors/app-error";

type RouteContext = {
  params: Promise<{ roundId: string }>;
};

/**
 * 일정별 RSVP 생성/참석 신청 API
 * POST /api/rounds/:roundId/rsvp
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { roundId } = await context.params;
    const userId = session.user.id;

    // 일정 조회
    const round = await db
      .select({
        id: scheduleRounds.id,
        scheduleId: scheduleRounds.scheduleId,
        capacity: scheduleRounds.capacity,
      })
      .from(scheduleRounds)
      .where(eq(scheduleRounds.id, roundId))
      .limit(1);

    if (round.length === 0) {
      throw new NotFoundError("일정를 찾을 수 없습니다");
    }

    const roundData = round[0];

    // 일정 조회 (크루 ID 확인용)
    const schedule = await db
      .select({ crewId: schedules.crewId })
      .from(schedules)
      .where(eq(schedules.id, roundData.scheduleId))
      .limit(1);

    if (schedule.length === 0) {
      throw new NotFoundError("일정을 찾을 수 없습니다");
    }

    // 크루 멤버인지 확인
    const membership = await db
      .select()
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, schedule[0].crewId), eq(crewMembers.userId, userId)))
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenError("크루 멤버만 참석 신청할 수 있습니다");
    }

    // 이미 RSVP했는지 확인
    const existingRsvp = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.roundId, roundId), eq(rsvps.userId, userId)))
      .limit(1);

    if (existingRsvp.length > 0) {
      throw new ConflictError("이미 참석 신청했습니다");
    }

    // 정원이 무제한(0)이면 항상 참석
    const isUnlimited = roundData.capacity === 0;
    let status: "attending" | "waiting" = "attending";

    if (!isUnlimited) {
      // 현재 참석자 수 확인
      const attendingCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(rsvps)
        .where(and(eq(rsvps.roundId, roundId), eq(rsvps.status, "attending")));

      const currentCount = attendingCount[0]?.count ?? 0;

      // 정원 초과 시 대기, 아니면 참석
      status = currentCount < roundData.capacity ? "attending" : "waiting";
    }

    // RSVP 생성
    const newRsvp = await db
      .insert(rsvps)
      .values({
        roundId,
        userId,
        status,
      })
      .returning();

    return NextResponse.json(
      {
        ...newRsvp[0],
        message: status === "attending" ? "참석 신청되었습니다" : "대기 등록되었습니다",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * 일정별 RSVP 취소 API
 * DELETE /api/rounds/:roundId/rsvp
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { roundId } = await context.params;
    const userId = session.user.id;

    // 내 RSVP 조회
    const myRsvp = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.roundId, roundId), eq(rsvps.userId, userId)))
      .limit(1);

    if (myRsvp.length === 0) {
      throw new NotFoundError("참석 신청 내역이 없습니다");
    }

    const wasAttending = myRsvp[0].status === "attending";

    // RSVP 삭제
    await db.delete(rsvps).where(and(eq(rsvps.roundId, roundId), eq(rsvps.userId, userId)));

    // 참석 취소 시 대기자 자동 승격
    if (wasAttending) {
      const firstWaiting = await db
        .select()
        .from(rsvps)
        .where(and(eq(rsvps.roundId, roundId), eq(rsvps.status, "waiting")))
        .orderBy(asc(rsvps.createdAt))
        .limit(1);

      if (firstWaiting.length > 0) {
        await db.update(rsvps).set({ status: "attending" }).where(eq(rsvps.id, firstWaiting[0].id));
      }
    }

    return NextResponse.json({ success: true, message: "참석 취소되었습니다" });
  } catch (error) {
    return handleError(error);
  }
}
