import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crewMembers, crews, rsvps } from "@/lib/db/schema";
import { eq, gte, asc, sql, and } from "drizzle-orm";
import { handleError, UnauthorizedError } from "@/lib/errors/app-error";

/**
 * 사용자의 모든 크루 일정 조회 API
 * GET /api/schedules
 * Query: limit (optional) - 반환할 일정 수 제한 (1~100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const today = new Date().toISOString().split("T")[0];
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 100)
      : undefined;

    // 사용자가 속한 크루의 모든 일정 조회
    const baseQuery = db
      .select({
        id: schedules.id,
        title: schedules.title,
        date: schedules.date,
        description: schedules.description,
        crewId: schedules.crewId,
        crewName: crews.name,
      })
      .from(schedules)
      .innerJoin(crews, eq(schedules.crewId, crews.id))
      .innerJoin(crewMembers, eq(crews.id, crewMembers.crewId))
      .where(and(eq(crewMembers.userId, userId), gte(schedules.date, today)))
      .orderBy(asc(schedules.date));

    const userSchedules = limit
      ? await baseQuery.limit(limit)
      : await baseQuery;

    // 각 일정의 일정와 첫 번째 일정의 참석 현황 조회
    const schedulesWithRounds = await Promise.all(
      userSchedules.map(async (schedule) => {
        // 일정 조회
        const rounds = await db
          .select()
          .from(scheduleRounds)
          .where(eq(scheduleRounds.scheduleId, schedule.id))
          .orderBy(asc(scheduleRounds.roundNumber));

        // 첫 번째 일정의 참석 현황
        const firstRound = rounds[0];
        let attendingCount = 0;
        let myStatus: string | null = null;

        if (firstRound) {
          const [countResult, myRsvp] = await Promise.all([
            db
              .select({ count: sql<number>`count(*)::int` })
              .from(rsvps)
              .where(and(eq(rsvps.roundId, firstRound.id), eq(rsvps.status, "attending"))),
            db
              .select({ status: rsvps.status })
              .from(rsvps)
              .where(and(eq(rsvps.roundId, firstRound.id), eq(rsvps.userId, userId)))
              .limit(1),
          ]);
          attendingCount = countResult[0]?.count ?? 0;
          myStatus = myRsvp[0]?.status === "cancelled" ? null : (myRsvp[0]?.status ?? null);
        }

        return {
          ...schedule,
          rounds,
          // 목록에서는 첫 번째 일정 기준 정보 표시
          startTime: firstRound?.startTime ?? "",
          endTime: firstRound?.endTime ?? "",
          location: firstRound?.location ?? "",
          capacity: firstRound?.capacity ?? 0,
          attendingCount,
          myStatus,
          roundCount: rounds.length,
        };
      }),
    );

    return NextResponse.json({ schedules: schedulesWithRounds });
  } catch (error) {
    return handleError(error);
  }
}
