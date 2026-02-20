import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { crewMembers, schedules, scheduleRounds, rsvps, users } from "@/lib/db/schema";
import { eq, and, sql, lte, inArray } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors/app-error";
import { isCrewLeaderOrAdmin } from "@/lib/utils/check-crew-permission";
import { validateUUID } from "@/lib/utils/validate-uuid";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * 크루 출석 통계 조회 API (크루장/운영진만)
 * GET /api/crews/:id/stats
 *
 * 통계는 'exercise' 타입 일정만 집계합니다.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id: crewId } = await context.params;
    validateUUID(crewId, "크루 ID");
    const userId = session.user.id;

    // 크루장/운영진 권한 확인
    const canView = await isCrewLeaderOrAdmin(crewId, userId);
    if (!canView) {
      throw new ForbiddenError("크루장 또는 운영진만 통계를 볼 수 있습니다");
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10) || 30, 1), 365);

    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // 크루 멤버 목록
    const members = await db
      .select({
        id: crewMembers.id,
        userId: crewMembers.userId,
        role: crewMembers.role,
        userName: users.name,
        userImage: users.image,
      })
      .from(crewMembers)
      .innerJoin(users, eq(crewMembers.userId, users.id))
      .where(eq(crewMembers.crewId, crewId));

    if (members.length === 0) {
      throw new NotFoundError("크루를 찾을 수 없습니다");
    }

    // 기간 내 운동 일정 수 (스케줄당 1회만 카운트)
    const totalExerciseRoundsResult = await db
      .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
      .from(scheduleRounds)
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(
        and(
          eq(schedules.crewId, crewId),
          eq(scheduleRounds.type, "exercise"),
          lte(schedules.date, today),
          sql`${schedules.date} >= ${startDateStr}`,
        ),
      );

    const totalExerciseRounds = totalExerciseRoundsResult[0]?.count ?? 0;

    // 기간 내 총 출석 수 (스케줄당 exercise 일정 중 하나라도 참석하면 1회로 카운트)
    const totalAttendanceResult = await db
      .select({ count: sql<number>`count(distinct ${schedules.id})::int` })
      .from(rsvps)
      .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
      .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
      .where(
        and(
          eq(schedules.crewId, crewId),
          eq(scheduleRounds.type, "exercise"),
          eq(rsvps.status, "attending"),
          lte(schedules.date, today),
          sql`${schedules.date} >= ${startDateStr}`,
        ),
      );

    const totalAttendance = totalAttendanceResult[0]?.count ?? 0;

    // 평균 출석률
    const maxPossibleAttendance = totalExerciseRounds * members.length;
    const averageAttendanceRate =
      maxPossibleAttendance > 0 ? Math.round((totalAttendance / maxPossibleAttendance) * 100) / 100 : 0;

    // 멤버별 출석 통계를 한 번에 조회 (N+1 방지)
    const memberUserIds = members.map((m) => m.userId);
    const memberAttendanceRows =
      memberUserIds.length > 0
        ? await db
            .select({
              userId: rsvps.userId,
              scheduleId: schedules.id,
            })
            .from(rsvps)
            .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
            .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
            .where(
              and(
                eq(schedules.crewId, crewId),
                eq(scheduleRounds.type, "exercise"),
                inArray(rsvps.userId, memberUserIds),
                eq(rsvps.status, "attending"),
                lte(schedules.date, today),
                sql`${schedules.date} >= ${startDateStr}`,
              ),
            )
        : [];

    // userId별 출석한 고유 scheduleId 집계
    const attendedSchedulesByUser = new Map<string, Set<string>>();
    for (const row of memberAttendanceRows) {
      const scheduleSet = attendedSchedulesByUser.get(row.userId) ?? new Set<string>();
      scheduleSet.add(row.scheduleId);
      attendedSchedulesByUser.set(row.userId, scheduleSet);
    }

    const memberStats = members.map((member) => {
      const attended = attendedSchedulesByUser.get(member.userId)?.size ?? 0;
      const rate = totalExerciseRounds > 0 ? Math.round((attended / totalExerciseRounds) * 100) / 100 : 0;

      return {
        memberId: member.id,
        userId: member.userId,
        name: member.userName,
        image: member.userImage,
        role: member.role,
        attended,
        total: totalExerciseRounds,
        rate,
      };
    });

    // 출석률 순으로 정렬
    memberStats.sort((a, b) => b.rate - a.rate);

    return NextResponse.json({
      totalSchedules: totalExerciseRounds,
      totalAttendance,
      averageAttendanceRate,
      memberStats,
    });
  } catch (error) {
    return handleError(error);
  }
}
