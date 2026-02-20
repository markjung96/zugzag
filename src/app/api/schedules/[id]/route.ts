import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { schedules, scheduleRounds, crews, crewMembers, rsvps, users } from "@/lib/db/schema";
import { eq, and, asc, ne, inArray } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors/app-error";
import { isCrewLeaderOrAdmin, getMemberRole } from "@/lib/utils/check-crew-permission";
import { UpdateScheduleDto } from "@/lib/dto/schedule.dto";
import { validateUUID } from "@/lib/utils/validate-uuid";

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
    validateUUID(scheduleId, "일정 ID");
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

    // 모든 round의 참석자 정보를 한 번에 조회 (N+1 방지)
    const roundIds = rounds.map((r) => r.id);
    const allAttendees =
      roundIds.length > 0
        ? await db
            .select({
              id: rsvps.id,
              roundId: rsvps.roundId,
              status: rsvps.status,
              userId: rsvps.userId,
              userName: users.name,
              userImage: users.image,
              createdAt: rsvps.createdAt,
            })
            .from(rsvps)
            .innerJoin(users, eq(rsvps.userId, users.id))
            .where(and(inArray(rsvps.roundId, roundIds), ne(rsvps.status, "cancelled")))
            .orderBy(rsvps.createdAt)
        : [];

    // roundId별 attendees 그룹핑
    const attendeesByRoundId = new Map<string, typeof allAttendees>();
    for (const attendee of allAttendees) {
      const existing = attendeesByRoundId.get(attendee.roundId) ?? [];
      existing.push(attendee);
      attendeesByRoundId.set(attendee.roundId, existing);
    }

    const roundsWithAttendees = rounds.map((round) => {
      const attendees = attendeesByRoundId.get(round.id) ?? [];
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
        myStatus: myRsvp?.status === "cancelled" ? null : myRsvp?.status ?? null,
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
    });

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
    validateUUID(scheduleId, "일정 ID");
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

    const result = await db.transaction(async (tx) => {
      await tx.delete(scheduleRounds).where(eq(scheduleRounds.scheduleId, scheduleId));

      const [updatedSchedule] = await tx
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

      const newRounds = await tx
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

      if (newRounds.length > 0) {
        await tx.insert(rsvps).values({
          roundId: newRounds[0].id,
          userId,
          status: "attending" as const,
        });
      }

      return { ...updatedSchedule, rounds: newRounds };
    });

    return NextResponse.json(result);
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
    validateUUID(scheduleId, "일정 ID");
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
