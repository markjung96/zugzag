import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, sql } from "@/lib/db";
import { schedules, scheduleRounds, crewMembers, rsvps } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { handleError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { mutationRateLimit } from "@/lib/rate-limit";
import { checkRateLimit } from "@/lib/utils/check-rate-limit";
import { validateUUID } from "@/lib/utils/validate-uuid";

type RouteContext = {
  params: Promise<{ roundId: string }>;
};

/**
 * 일정별 RSVP 생성/참석 신청 API
 * POST /api/rounds/:roundId/rsvp
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const rateLimitResponse = await checkRateLimit(request, mutationRateLimit);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { roundId } = await context.params;
    validateUUID(roundId, "라운드 ID");
    const userId = session.user.id;

    // 일정 조회
    const round = await db
      .select({
        id: scheduleRounds.id,
        scheduleId: scheduleRounds.scheduleId,
        capacity: scheduleRounds.capacity,
      })
      .from(scheduleRounds)
      .where(eq(scheduleRounds.id, roundId))
      .limit(1);

    if (round.length === 0) {
      throw new NotFoundError("일정를 찾을 수 없습니다");
    }

    const roundData = round[0];

    // 일정 조회 (크루 ID 확인용)
    const schedule = await db
      .select({ crewId: schedules.crewId })
      .from(schedules)
      .where(eq(schedules.id, roundData.scheduleId))
      .limit(1);

    if (schedule.length === 0) {
      throw new NotFoundError("일정을 찾을 수 없습니다");
    }

    // 크루 멤버인지 확인
    const membership = await db
      .select()
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, schedule[0].crewId), eq(crewMembers.userId, userId)))
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenError("크루 멤버만 참석 신청할 수 있습니다");
    }

    // 이미 RSVP했는지 확인 (cancelled는 재신청 가능)
    const existingRsvp = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.roundId, roundId), eq(rsvps.userId, userId)))
      .limit(1);

    if (existingRsvp.length > 0) {
      const existing = existingRsvp[0];
      if (existing.status !== "cancelled") {
        throw new ConflictError("이미 참석 신청했습니다");
      }

      // 취소된 RSVP가 있으면 UPDATE로 재신청 (중복 row 방지)
      const [updateResult] = await sql.transaction([
        sql`
        WITH round_info AS (
          SELECT capacity FROM schedule_rounds WHERE id = ${roundId}
        ),
        attending_count AS (
          SELECT count(*)::int AS cnt FROM rsvps
          WHERE round_id = ${roundId} AND status = 'attending'
        ),
        new_status AS (
          SELECT
            CASE
              WHEN r.capacity = 0 THEN 'attending'::rsvp_status
              WHEN a.cnt < r.capacity THEN 'attending'::rsvp_status
              ELSE 'waiting'::rsvp_status
            END AS status
          FROM round_info r
          CROSS JOIN attending_count a
        )
        UPDATE rsvps
        SET status = (SELECT status FROM new_status)
        WHERE round_id = ${roundId}::uuid AND user_id = ${userId}::uuid AND status = 'cancelled'
        RETURNING *
        `,
      ]);

      const row = updateResult?.[0] as Record<string, unknown> | undefined;
      if (!row) {
        return NextResponse.json(
          { error: "RSVP 재신청에 실패했습니다", code: "INTERNAL_ERROR" },
          { status: 500 }
        );
      }

      const status = row.status as "attending" | "waiting";
      const newRsvp = {
        id: row.id,
        roundId: row.round_id,
        userId: row.user_id,
        status: row.status,
        createdAt: row.created_at,
      };
      return NextResponse.json(
        {
          ...newRsvp,
          message: status === "attending" ? "참석 신청되었습니다" : "대기 등록되었습니다",
        },
        { status: 201 },
      );
    }

    // 트랜잭션: 정원 확인 + RSVP 삽입을 원자적으로 실행 (race condition 방지)
    const [insertResult] = await sql.transaction([
      sql`
      WITH round_info AS (
        SELECT capacity FROM schedule_rounds WHERE id = ${roundId}
      ),
      attending_count AS (
        SELECT count(*)::int AS cnt FROM rsvps
        WHERE round_id = ${roundId} AND status = 'attending'
      ),
      new_status AS (
        SELECT
          CASE
            WHEN r.capacity = 0 THEN 'attending'::rsvp_status
            WHEN a.cnt < r.capacity THEN 'attending'::rsvp_status
            ELSE 'waiting'::rsvp_status
          END AS status
        FROM round_info r
        CROSS JOIN attending_count a
      )
      INSERT INTO rsvps (round_id, user_id, status)
      SELECT ${roundId}::uuid, ${userId}::uuid, status FROM new_status
      RETURNING *
    `,
    ]);

    const row = insertResult?.[0] as Record<string, unknown> | undefined;
    if (!row) {
      return NextResponse.json(
        { error: "RSVP 생성에 실패했습니다", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    const status = row.status as "attending" | "waiting";
    const newRsvp = {
      id: row.id,
      roundId: row.round_id,
      userId: row.user_id,
      status: row.status,
      createdAt: row.created_at,
    };
    return NextResponse.json(
      {
        ...newRsvp,
        message: status === "attending" ? "참석 신청되었습니다" : "대기 등록되었습니다",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * 일정별 RSVP 취소 API
 * DELETE /api/rounds/:roundId/rsvp
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const { roundId } = await context.params;
    validateUUID(roundId, "라운드 ID");
    const userId = session.user.id;

    // 내 RSVP 조회
    const myRsvp = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.roundId, roundId), eq(rsvps.userId, userId)))
      .limit(1);

    if (myRsvp.length === 0) {
      throw new NotFoundError("참석 신청 내역이 없습니다");
    }

    const wasAttending = myRsvp[0].status === "attending";

    // 이미 취소된 상태면 성공 반환 (idempotent)
    if (myRsvp[0].status === "cancelled") {
      return NextResponse.json({ success: true, message: "참석 취소되었습니다" });
    }

    await db.transaction(async (tx) => {
      await tx.update(rsvps).set({ status: "cancelled" }).where(and(eq(rsvps.roundId, roundId), eq(rsvps.userId, userId)));

      if (wasAttending) {
        const firstWaiting = await tx
          .select()
          .from(rsvps)
          .where(and(eq(rsvps.roundId, roundId), eq(rsvps.status, "waiting")))
          .orderBy(asc(rsvps.createdAt))
          .limit(1);

        if (firstWaiting.length > 0) {
          await tx.update(rsvps).set({ status: "attending" }).where(eq(rsvps.id, firstWaiting[0].id));
        }
      }
    });

    return NextResponse.json({ success: true, message: "참석 취소되었습니다" });
  } catch (error) {
    return handleError(error);
  }
}
