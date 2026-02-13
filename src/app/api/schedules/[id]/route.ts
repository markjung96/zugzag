import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crews, crewMembers, rsvps, users } from "@/lib/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors/app-error";
import { isCrewLeaderOrAdmin, getMemberRole } from "@/lib/utils/check-crew-permission";

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
  capacity: z.number().int().min(0).max(100),
});

const UpdateScheduleDto = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
  description: z.string().max(500).optional(),
  rounds: z.array(RoundDto).min(1, "최소 1개의 일정가 필요합니다").max(5),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * 일정 상세 조회 API
 * GET /api/schedules/:id
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id: scheduleId } = await context.params;
    const userId = session.user.id;

    // 일정 조회 (생성자/수정자 정보 포함)
    const schedule = await db
      .select({
        id: schedules.id,
        title: schedules.title,
        date: schedules.date,
        description: schedules.description,
        crewId: schedules.crewId,
        crewName: crews.name,
        leaderId: crews.leaderId,
        createdBy: schedules.createdBy,
        updatedBy: schedules.updatedBy,
        updatedAt: schedules.updatedAt,
      })
      .from(schedules)
      .innerJoin(crews, eq(schedules.crewId, crews.id))
      .where(eq(schedules.id, scheduleId))
      .limit(1);

    if (schedule.length === 0) {
      throw new NotFoundError("일정을 찾을 수 없습니다");
    }

    const scheduleData = schedule[0];

    // 크루 멤버인지 확인
    const membership = await db
      .select()
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, scheduleData.crewId), eq(crewMembers.userId, userId)))
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenError("크루 멤버만 일정을 볼 수 있습니다");
    }

    // 내 역할 확인 (크루장/운영진 또는 생성자)
    const myRole = await getMemberRole(scheduleData.crewId, userId);
    const isCreator = scheduleData.createdBy === userId;
    const canManage = myRole === "leader" || myRole === "admin" || isCreator;

    // 일정 목록 조회
    const rounds = await db
      .select()
      .from(scheduleRounds)
      .where(eq(scheduleRounds.scheduleId, scheduleId))
      .orderBy(asc(scheduleRounds.roundNumber));

    // 각 일정별 참석자 정보 조회
    const roundsWithAttendees = await Promise.all(
      rounds.map(async (round) => {
        const attendees = await db
          .select({
            id: rsvps.id,
            status: rsvps.status,
            userId: rsvps.userId,
            userName: users.name,
            userImage: users.image,
            createdAt: rsvps.createdAt,
          })
          .from(rsvps)
          .innerJoin(users, eq(rsvps.userId, users.id))
          .where(eq(rsvps.roundId, round.id))
          .orderBy(rsvps.createdAt);

        const myRsvp = attendees.find((a) => a.userId === userId);
        const attending = attendees.filter((a) => a.status === "attending");
        const waiting = attendees.filter((a) => a.status === "waiting");

        return {
          id: round.id,
          roundNumber: round.roundNumber,
          type: round.type,
          title: round.title,
          startTime: round.startTime,
          endTime: round.endTime,
          location: round.location,
          capacity: round.capacity,
          attendingCount: attending.length,
          waitingCount: waiting.length,
          myStatus: myRsvp?.status ?? null,
          attendees: attending.map((a) => ({
            id: a.id,
            userId: a.userId,
            name: a.userName,
            image: a.userImage,
          })),
          waitlist: waiting.map((a) => ({
            id: a.id,
            userId: a.userId,
            name: a.userName,
            image: a.userImage,
          })),
        };
      }),
    );

    return NextResponse.json({
      ...scheduleData,
      canManage,
      rounds: roundsWithAttendees,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * 일정 수정 API
 * PUT /api/schedules/:id
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id: scheduleId } = await context.params;
    const userId = session.user.id;

    // 일정 조회
    const schedule = await db
      .select({
        id: schedules.id,
        crewId: schedules.crewId,
        createdBy: schedules.createdBy,
      })
      .from(schedules)
      .where(eq(schedules.id, scheduleId))
      .limit(1);

    if (schedule.length === 0) {
      throw new NotFoundError("일정을 찾을 수 없습니다");
    }

    const scheduleData = schedule[0];

    // 권한 확인 (크루장/운영진 또는 생성자)
    const isLeaderOrAdmin = await isCrewLeaderOrAdmin(scheduleData.crewId, userId);
    const isCreator = scheduleData.createdBy === userId;
    if (!isLeaderOrAdmin && !isCreator) {
      throw new ForbiddenError("일정을 수정할 권한이 없습니다");
    }

    // Request body parsing & validation
    const body = await request.json();
    const data = UpdateScheduleDto.parse(body);

    // 기존 일정 삭제 (CASCADE로 RSVP도 삭제됨)
    await db.delete(scheduleRounds).where(eq(scheduleRounds.scheduleId, scheduleId));

    // 일정 업데이트
    const [updatedSchedule] = await db
      .update(schedules)
      .set({
        title: data.title,
        date: data.date,
        description: data.description || null,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(schedules.id, scheduleId))
      .returning();

    // 새 일정 생성
    const newRounds = await db
      .insert(scheduleRounds)
      .values(
        data.rounds.map((round) => ({
          scheduleId,
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

    // 수정자를 첫 번째 일정에 참석 상태로 등록
    if (newRounds.length > 0) {
      await db.insert(rsvps).values({
        roundId: newRounds[0].id,
        userId,
        status: "attending" as const,
      });
    }

    return NextResponse.json({ ...updatedSchedule, rounds: newRounds });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * 일정 삭제 API
 * DELETE /api/schedules/:id
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { id: scheduleId } = await context.params;
    const userId = session.user.id;

    // 일정 조회
    const schedule = await db
      .select({
        id: schedules.id,
        crewId: schedules.crewId,
        createdBy: schedules.createdBy,
      })
      .from(schedules)
      .where(eq(schedules.id, scheduleId))
      .limit(1);

    if (schedule.length === 0) {
      throw new NotFoundError("일정을 찾을 수 없습니다");
    }

    // 권한 확인 (크루장/운영진 또는 생성자)
    const isLeaderOrAdmin = await isCrewLeaderOrAdmin(schedule[0].crewId, userId);
    const isCreator = schedule[0].createdBy === userId;
    if (!isLeaderOrAdmin && !isCreator) {
      throw new ForbiddenError("일정을 삭제할 권한이 없습니다");
    }

    // 일정 삭제 (CASCADE로 일정, RSVP도 삭제됨)
    await db.delete(schedules).where(eq(schedules.id, scheduleId));

    return NextResponse.json({ message: "일정이 삭제되었습니다" });
  } catch (error) {
    return handleError(error);
  }
}
