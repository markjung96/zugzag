import { NextResponse } from "next/server";

import { registerAttendance, updateAttendanceStatus } from "@/lib/api/event-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/events/[id]/rsvp
 * 참석 등록
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: event_id } = await params;
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
    const { phase_id, user_note } = body;

    const result = await registerAttendance({
      event_id,
      user_id: user.id,
      phase_id,
      user_note,
    });

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
 * PATCH /api/events/[id]/rsvp
 * 참석 상태 변경
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: _event_id } = await params;
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
      .from("event_attendances")
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
