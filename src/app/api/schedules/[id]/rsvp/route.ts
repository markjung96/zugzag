import { NextResponse } from "next/server";

import {
  registerAttendance,
  updateAttendanceStatus,
  registerPhaseAttendance,
  getPhaseAttendances,
} from "@/lib/api/schedule-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/schedules/[id]/rsvp
 * 참석 등록
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: schedule_id } = await params;
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phase_id, user_note, status } = body;

    // status가 제공되고 phase_id가 있는 경우 단계별 RSVP 사용
    if (status && (phase_id || phase_id === null)) {
      const result = await registerPhaseAttendance(
        schedule_id,
        phase_id,
        user.id,
        status,
        user_note,
      );
      return NextResponse.json(result);
    }

    // 기존 로직: phase_id만 있거나 status가 없는 경우
    const result = await registerAttendance({
      schedule_id,
      user_id: user.id,
      phase_id,
      user_note,
    });

    // status가 제공된 경우 상태 업데이트
    if (status && status !== "attending") {
      const { data: attendance } = await supabase
        .from("schedule_attendances")
        .select("id")
        .eq("schedule_id", schedule_id)
        .eq("user_id", user.id)
        .single();

      if (attendance) {
        await updateAttendanceStatus(attendance.id, status, user_note);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error registering attendance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/schedules/[id]/rsvp
 * 참석 상태 변경
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: _schedule_id } = await params;
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { attendance_id, status, user_note } = body;

    if (!attendance_id || !status) {
      return NextResponse.json({ error: "attendance_id and status are required" }, { status: 400 });
    }

    // 본인의 참석 기록인지 확인
    const { data: attendance } = await supabase
      .from("schedule_attendances")
      .select("user_id")
      .eq("id", attendance_id)
      .single();

    if (!attendance || attendance.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await updateAttendanceStatus(attendance_id, status, user_note);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/schedules/[id]/rsvp
 * 사용자의 단계별 참석 정보 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: schedule_id } = await params;
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getPhaseAttendances(schedule_id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching phase attendances:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
