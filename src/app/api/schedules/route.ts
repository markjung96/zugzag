import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crewMembers, crews, rsvps } from "@/lib/db/schema";
import { eq, gte, asc, sql, and, inArray } from "drizzle-orm";
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

    const userSchedules = limit ? await baseQuery.limit(limit) : await baseQuery;

    if (userSchedules.length === 0) {
      return NextResponse.json({ schedules: [] });
    }

    const scheduleIds = userSchedules.map((s) => s.id);

    // 모든 일정의 rounds를 한 번에 조회 (N+1 방지)
    const allRounds = await db
      .select()
      .from(scheduleRounds)
      .where(inArray(scheduleRounds.scheduleId, scheduleIds))
      .orderBy(asc(scheduleRounds.roundNumber));

    // scheduleId별 rounds 그룹핑
    const roundsByScheduleId = new Map<string, typeof allRounds>();
    for (const round of allRounds) {
      const existing = roundsByScheduleId.get(round.scheduleId) ?? [];
      existing.push(round);
      roundsByScheduleId.set(round.scheduleId, existing);
    }

    // 각 일정의 첫 번째 round ID 수집
    const firstRoundIds = userSchedules
      .map((s) => roundsByScheduleId.get(s.id)?.[0]?.id)
      .filter((id): id is string => id !== undefined);

    // 모든 첫 번째 round의 RSVP를 한 번에 조회 (N+1 방지)
    const allRsvps =
      firstRoundIds.length > 0
        ? await db
            .select({
              roundId: rsvps.roundId,
              userId: rsvps.userId,
              status: rsvps.status,
            })
            .from(rsvps)
            .where(inArray(rsvps.roundId, firstRoundIds))
        : [];

    // roundId별 RSVPs 그룹핑
    const rsvpsByRoundId = new Map<string, typeof allRsvps>();
    for (const rsvp of allRsvps) {
      const existing = rsvpsByRoundId.get(rsvp.roundId) ?? [];
      existing.push(rsvp);
      rsvpsByRoundId.set(rsvp.roundId, existing);
    }

    const schedulesWithRounds = userSchedules.map((schedule) => {
      const rounds = roundsByScheduleId.get(schedule.id) ?? [];
      const firstRound = rounds[0];

      let attendingCount = 0;
      let myStatus: string | null = null;

      if (firstRound) {
        const roundRsvps = rsvpsByRoundId.get(firstRound.id) ?? [];
        attendingCount = roundRsvps.filter((r) => r.status === "attending").length;
        const myRsvp = roundRsvps.find((r) => r.userId === userId);
        myStatus = myRsvp?.status === "cancelled" ? null : (myRsvp?.status ?? null);
      }

      return {
        ...schedule,
        rounds,
        startTime: firstRound?.startTime ?? "",
        endTime: firstRound?.endTime ?? "",
        location: firstRound?.location ?? "",
        capacity: firstRound?.capacity ?? 0,
        attendingCount,
        myStatus,
        roundCount: rounds.length,
      };
    });

    return NextResponse.json({ schedules: schedulesWithRounds });
  } catch (error) {
    return handleError(error);
  }
}
