import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crews, crewMembers, rsvps } from "@/lib/db/schema";
import { eq, and, gte, asc, sql } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors/app-error";
import { isCrewLeaderOrAdmin } from "@/lib/utils/check-crew-permission";

const PlaceInfoDto = z
  .object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    category: z.string().optional(),
    phone: z.string().optional(),
    x: z.string(),
    y: z.string(),
    url: z.string().optional(),
  })
  .optional();

const RoundDto = z.object({
  roundNumber: z.number().int().min(1).max(5),
  type: z.enum(["exercise", "meal", "afterparty", "other"]),
  title: z.string().min(1).max(50),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "시작 시간 형식이 올바르지 않습니다"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "종료 시간 형식이 올바르지 않습니다"),
  location: z.string().min(1).max(255),
  placeInfo: PlaceInfoDto,
  capacity: z.number().int().min(0).max(100), // 0 = 무관
});

const CreateScheduleDto = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
  description: z.string().max(500).optional(),
  rounds: z.array(RoundDto).min(1, "최소 1개의 일정가 필요합니다").max(5),
});

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

    // 각 일정의 일정와 첫 번째 일정의 참석 현황 조회
    const schedulesWithRounds = await Promise.all(
      crewSchedules.map(async (schedule) => {
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
          myStatus = myRsvp[0]?.status ?? null;
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

/**
 * 크루 일정 생성 API
 * POST /api/crews/:id/schedules
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id: crewId } = await context.params;
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
