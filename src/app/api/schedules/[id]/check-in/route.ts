import { NextResponse } from "next/server";

import {
  adminCheckIn,
  adminCheckOut,
  updateAttendanceByAdmin,
  promoteSpecificWaitlistUser,
  getScheduleAttendances,
  autoMarkNoShow,
} from "@/lib/api/schedule-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/schedules/[id]/check-in
 * 체크인 관리 페이지용 참석자 목록 조회
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
    // 일정 생성자 또는 크루 관리자인지 확인
    const { data: schedule } = await supabase
      .from("schedules")
      .select("created_by, crew_id")
      .eq("id", schedule_id)
      .single();

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const isCreator = schedule.created_by === user.id;
    let isAdmin = false;

    if (schedule.crew_id) {
      const { data: membership } = await supabase
        .from("crew_members")
        .select("role")
        .eq("crew_id", schedule.crew_id)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      isAdmin = membership?.role && ["owner", "admin"].includes(membership.role) ? true : false;
    }

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 참석자 목록 조회
    const { attendances } = await getScheduleAttendances(schedule_id);

    return NextResponse.json({ attendances });
  } catch (error) {
    console.error("Error fetching check-in attendances:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/schedules/[id]/check-in
 * 관리자 출석 관리 (체크인/체크아웃/상태 변경)
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
    // 일정 생성자 또는 크루 관리자인지 확인
    const { data: schedule } = await supabase
      .from("schedules")
      .select("created_by, crew_id")
      .eq("id", schedule_id)
      .single();

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const isCreator = schedule.created_by === user.id;
    let isAdmin = false;

    if (schedule.crew_id) {
      const { data: membership } = await supabase
        .from("crew_members")
        .select("role")
        .eq("crew_id", schedule.crew_id)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      isAdmin = membership?.role && ["owner", "admin"].includes(membership.role) ? true : false;
    }

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { attendance_id, action, status, admin_note } = body;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    // auto_mark_noshow는 attendance_id가 필요 없음
    if (action !== "auto_mark_noshow" && !attendance_id) {
      return NextResponse.json({ error: "attendance_id is required" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "check_in":
        result = await adminCheckIn(attendance_id, admin_note);
        break;
      case "check_out":
        result = await adminCheckOut(attendance_id, admin_note);
        break;
      case "update_status":
        if (!status) {
          return NextResponse.json(
            { error: "status is required for update_status" },
            { status: 400 },
          );
        }
        result = await updateAttendanceByAdmin(attendance_id, status, admin_note);
        break;
      case "promote":
        result = await promoteSpecificWaitlistUser(attendance_id);
        break;
      case "auto_mark_noshow":
        result = await autoMarkNoShow(schedule_id);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error managing attendance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
