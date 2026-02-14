import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { crewMembers, rsvps, schedules, scheduleRounds } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { handleError, UnauthorizedError } from "@/lib/errors/app-error";

/**
 * 프로필 통계 조회 API
 * GET /api/profile/stats
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;

    // 소속 크루 수
    const crewCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(crewMembers)
      .where(eq(crewMembers.userId, userId));

    const today = new Date().toISOString().split("T")[0];

    // 총 출석 수 (스케줄당 exercise 일정 중 하나라도 참석하면 1회로 카운트)
    const attendanceResult = await db
      .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
      .from(rsvps)
      .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(and(eq(rsvps.userId, userId), eq(rsvps.status, "attending"), eq(scheduleRounds.type, "exercise")));

    // 전체 운동 일정 수 (사용자가 속한 크루의 과거 exercise 스케줄, 출석률 분모)
    const totalSchedulesResult = await db
      .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
      .from(scheduleRounds)
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .innerJoin(crewMembers, eq(schedules.crewId, crewMembers.crewId))
      .where(
        and(
          eq(crewMembers.userId, userId),
          eq(scheduleRounds.type, "exercise"),
          lte(schedules.date, today),
        ),
      );

    const totalCrews = crewCountResult[0]?.count ?? 0;
    const totalSchedules = attendanceResult[0]?.count ?? 0;
    const totalPastSchedules = totalSchedulesResult[0]?.count ?? 0;
    const attendanceRate = totalPastSchedules > 0 ? Math.round((totalSchedules / totalPastSchedules) * 100) / 100 : 0;

    return NextResponse.json({
      totalCrews,
      totalSchedules,
      attendanceRate,
    });
  } catch (error) {
    return handleError(error);
  }
}
