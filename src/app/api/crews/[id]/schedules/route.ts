import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crews, crewMembers, rsvps } from "@/lib/db/schema";
import { eq, and, gte, asc, inArray } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors/app-error";
import { isCrewLeaderOrAdmin } from "@/lib/utils/check-crew-permission";
import { validateUUID } from "@/lib/utils/validate-uuid";
import { mutationRateLimit } from "@/lib/rate-limit";
import { checkRateLimit } from "@/lib/utils/check-rate-limit";
import { CreateScheduleDto } from "@/lib/dto/schedule.dto";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * 크루 일정 목록 조회 API
 * GET /api/crews/:id/schedules
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

    // 크루 멤버인지 확인
    const membership = await db
      .select()
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId)))
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenError("크루 멤버만 일정을 볼 수 있습니다");
    }

    const today = new Date().toISOString().split("T")[0];

    // 크루의 다가오는 일정 조회
    const crewSchedules = await db
      .select()
      .from(schedules)
      .where(and(eq(schedules.crewId, crewId), gte(schedules.date, today)))
      .orderBy(asc(schedules.date));

    if (crewSchedules.length === 0) {
      return NextResponse.json({ schedules: [] });
    }

    const scheduleIds = crewSchedules.map((s) => s.id);

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
    const firstRoundIds = crewSchedules
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

    const schedulesWithRounds = crewSchedules.map((schedule) => {
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
        // 목록에서는 첫 번째 일정 기준 정보 표시
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

/**
 * 크루 일정 생성 API
 * POST /api/crews/:id/schedules
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const rateLimitResponse = await checkRateLimit(request, mutationRateLimit);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id: crewId } = await context.params;
    validateUUID(crewId, "크루 ID");
    const userId = session.user.id;

    // 크루 존재 여부 확인
    const crew = await db.select().from(crews).where(eq(crews.id, crewId)).limit(1);

    if (crew.length === 0) {
      throw new NotFoundError("크루를 찾을 수 없습니다");
    }

    // 크루장/운영진 권한 확인
    const canCreate = await isCrewLeaderOrAdmin(crewId, userId);
    if (!canCreate) {
      throw new ForbiddenError("크루장 또는 운영진만 일정을 만들 수 있습니다");
    }

    // Request body parsing & validation
    const body = await request.json();
    const data = CreateScheduleDto.parse(body);

    // 일정 생성
    const [newSchedule] = await db
      .insert(schedules)
      .values({
        crewId,
        title: data.title,
        date: data.date,
        description: data.description || null,
        createdBy: userId,
      })
      .returning();

    // 일정 생성
    const newRounds = await db
      .insert(scheduleRounds)
      .values(
        data.rounds.map((round) => ({
          scheduleId: newSchedule.id,
          roundNumber: round.roundNumber,
          type: round.type,
          title: round.title,
          startTime: round.startTime,
          endTime: round.endTime,
          location: round.location,
          placeId: round.placeInfo?.id ?? null,
          placeName: round.placeInfo?.name ?? null,
          placeAddress: round.placeInfo?.address ?? null,
          placeCategory: round.placeInfo?.category ?? null,
          placePhone: round.placeInfo?.phone ?? null,
          placeLongitude: round.placeInfo?.x ?? null,
          placeLatitude: round.placeInfo?.y ?? null,
          placeUrl: round.placeInfo?.url ?? null,
          capacity: round.capacity,
        })),
      )
      .returning();

    // 생성자를 모든 일정에 참석 상태로 등록
    await db.insert(rsvps).values(
      newRounds.map((round) => ({
        roundId: round.id,
        userId,
        status: "attending" as const,
      })),
    );

    const result = { ...newSchedule, rounds: newRounds };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
