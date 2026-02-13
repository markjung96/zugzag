import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { crewMembers, crews, schedules, scheduleRounds, rsvps } from "@/lib/db/schema";
import { eq, and, sql, lte } from "drizzle-orm";
import { handleError, UnauthorizedError } from "@/lib/errors/app-error";

/**
 * 내 출석 기록 조회 API
 * GET /api/users/me/attendance
 *
 * 통계는 'exercise' 타입 일정만 집계합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const crewIdFilter = searchParams.get("crewId");

    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // 내가 속한 크루 목록
    const myCrews = await db
      .select({
        crewId: crewMembers.crewId,
        crewName: crews.name,
      })
      .from(crewMembers)
      .innerJoin(crews, eq(crewMembers.crewId, crews.id))
      .where(eq(crewMembers.userId, userId));

    if (myCrews.length === 0) {
      return NextResponse.json({
        overall: { attended: 0, total: 0, rate: 0 },
        byCrews: [],
      });
    }

    const crewIds = crewIdFilter ? [crewIdFilter] : myCrews.map((c) => c.crewId);

    // 크루별 통계 계산 (스케줄당 exercise 일정 중 하나라도 있으면 1회로 카운트)
    const byCrews = await Promise.all(
      myCrews
        .filter((c) => crewIds.includes(c.crewId))
        .map(async (crew) => {
          // 해당 크루의 운동 일정 수 (스케줄당 1회만 카운트)
          const totalExerciseRounds = await db
            .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
            .from(scheduleRounds)
            .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
            .where(
              and(
                eq(schedules.crewId, crew.crewId),
                eq(scheduleRounds.type, "exercise"),
                lte(schedules.date, today),
                sql`${schedules.date} >= ${startDateStr}`,
              ),
            );

          // 해당 크루에서 내가 참석한 운동 일정 수 (스케줄당 1회만 카운트)
          const attendedRounds = await db
            .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
            .from(rsvps)
            .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
            .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
            .where(
              and(
                eq(schedules.crewId, crew.crewId),
                eq(scheduleRounds.type, "exercise"),
                eq(rsvps.userId, userId),
                eq(rsvps.status, "attending"),
                lte(schedules.date, today),
                sql`${schedules.date} >= ${startDateStr}`,
              ),
            );

          const total = totalExerciseRounds[0]?.count ?? 0;
          const attended = attendedRounds[0]?.count ?? 0;
          const rate = total > 0 ? Math.round((attended / total) * 100) / 100 : 0;

          return {
            crewId: crew.crewId,
            crewName: crew.crewName,
            attended,
            total,
            rate,
          };
        }),
    );

    // 전체 통계
    const overallAttended = byCrews.reduce((sum, c) => sum + c.attended, 0);
    const overallTotal = byCrews.reduce((sum, c) => sum + c.total, 0);
    const overallRate = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) / 100 : 0;

    return NextResponse.json({
      overall: {
        attended: overallAttended,
        total: overallTotal,
        rate: overallRate,
      },
      byCrews,
    });
  } catch (error) {
    return handleError(error);
  }
}
