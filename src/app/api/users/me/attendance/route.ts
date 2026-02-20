import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { crewMembers, crews, schedules, scheduleRounds, rsvps } from "@/lib/db/schema";
import { eq, and, sql, lte, inArray } from "drizzle-orm";
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
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10) || 30, 1), 365);
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
        totalSchedules: 0,
        attendedSchedules: 0,
        attendanceRate: 0,
        crewStats: [],
      });
    }

    const filteredCrews = crewIdFilter
      ? myCrews.filter((c) => c.crewId === crewIdFilter)
      : myCrews;

    if (filteredCrews.length === 0) {
      return NextResponse.json({
        totalSchedules: 0,
        attendedSchedules: 0,
        attendanceRate: 0,
        crewStats: [],
      });
    }

    const crewIds = filteredCrews.map((c) => c.crewId);

    // 크루별 운동 일정 수를 한 번에 조회 (N+1 방지)
    const totalRoundsRows = await db
      .select({
        crewId: schedules.crewId,
        scheduleId: schedules.id,
      })
      .from(scheduleRounds)
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(
        and(
          inArray(schedules.crewId, crewIds),
          eq(scheduleRounds.type, "exercise"),
          lte(schedules.date, today),
          sql`${schedules.date} >= ${startDateStr}`,
        ),
      );

    // 크루별 고유 scheduleId 집계 (스케줄당 1회 카운트)
    const totalSchedulesByCrew = new Map<string, Set<string>>();
    for (const row of totalRoundsRows) {
      const set = totalSchedulesByCrew.get(row.crewId) ?? new Set<string>();
      set.add(row.scheduleId);
      totalSchedulesByCrew.set(row.crewId, set);
    }

    // 내가 참석한 운동 일정을 한 번에 조회 (N+1 방지)
    const attendedRows = await db
      .select({
        crewId: schedules.crewId,
        scheduleId: schedules.id,
      })
      .from(rsvps)
      .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(
        and(
          inArray(schedules.crewId, crewIds),
          eq(scheduleRounds.type, "exercise"),
          eq(rsvps.userId, userId),
          eq(rsvps.status, "attending"),
          lte(schedules.date, today),
          sql`${schedules.date} >= ${startDateStr}`,
        ),
      );

    // 크루별 고유 출석 scheduleId 집계
    const attendedSchedulesByCrew = new Map<string, Set<string>>();
    for (const row of attendedRows) {
      const set = attendedSchedulesByCrew.get(row.crewId) ?? new Set<string>();
      set.add(row.scheduleId);
      attendedSchedulesByCrew.set(row.crewId, set);
    }

    const byCrews = filteredCrews.map((crew) => {
      const total = totalSchedulesByCrew.get(crew.crewId)?.size ?? 0;
      const attended = attendedSchedulesByCrew.get(crew.crewId)?.size ?? 0;
      const attendanceRate = total > 0 ? Math.round((attended / total) * 100) / 100 : 0;

      return {
        crewId: crew.crewId,
        crewName: crew.crewName,
        attended,
        total,
        attendanceRate,
      };
    });

    // 전체 통계
    const attendedSchedules = byCrews.reduce((sum, c) => sum + c.attended, 0);
    const totalSchedules = byCrews.reduce((sum, c) => sum + c.total, 0);
    const attendanceRate = totalSchedules > 0 ? Math.round((attendedSchedules / totalSchedules) * 100) / 100 : 0;

    return NextResponse.json({
      totalSchedules,
      attendedSchedules,
      attendanceRate,
      crewStats: byCrews,
    });
  } catch (error) {
    return handleError(error);
  }
}
