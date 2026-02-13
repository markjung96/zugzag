import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { crewMembers, rsvps, schedules, scheduleRounds } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
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

    // 총 출석 수 (스케줄당 exercise 일정 중 하나라도 참석하면 1회로 카운트)
    const attendanceResult = await db
      .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
      .from(rsvps)
      .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(and(eq(rsvps.userId, userId), eq(rsvps.status, "attending"), eq(scheduleRounds.type, "exercise")));

    // 다가오는 일정 수 (오늘 이후, 첫 번째 일정 기준)
    const today = new Date().toISOString().split("T")[0];
    const upcomingResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rsvps)
      .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(and(eq(rsvps.userId, userId), eq(rsvps.status, "attending"), gte(schedules.date, today)));

    return NextResponse.json({
      crewCount: crewCountResult[0]?.count ?? 0,
      totalAttendance: attendanceResult[0]?.count ?? 0,
      upcomingSchedules: upcomingResult[0]?.count ?? 0,
    });
  } catch (error) {
    return handleError(error);
  }
}
