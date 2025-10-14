import { NextResponse } from "next/server";

import { getScheduleById, updateSchedule, deleteSchedule } from "@/lib/api/schedule-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/schedules/[id]
 * 일정 상세 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { schedule } = await getScheduleById(id);
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/schedules/[id]
 * 일정 수정
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 일정 소유권 확인
    const { data: schedule } = await supabase
      .from("schedules")
      .select("created_by, crew_id")
      .eq("id", id)
      .single();

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // 생성자이거나 크루 관리자인지 확인
    const isCreator = schedule.created_by === user.id;
    let isAdmin = false;

    // crew_id가 있는 경우에만 크루 멤버십 확인
    if (schedule.crew_id) {
      const { data: membership } = await supabase
        .from("crew_members")
        .select("role")
        .eq("crew_id", schedule.crew_id)
        .eq("user_id", user.id)
        .single();

      isAdmin = !!(membership?.role && ["owner", "admin"].includes(membership.role));
    }

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updatedSchedule = await updateSchedule(id, body);

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/schedules/[id]
 * 일정 삭제
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 일정 소유권 확인
    const { data: schedule } = await supabase
      .from("schedules")
      .select("created_by, crew_id")
      .eq("id", id)
      .single();

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // 생성자이거나 크루 관리자인지 확인
    const isCreator = schedule.created_by === user.id;
    let isAdmin = false;

    // crew_id가 있는 경우에만 크루 멤버십 확인
    if (schedule.crew_id) {
      const { data: membership } = await supabase
        .from("crew_members")
        .select("role")
        .eq("crew_id", schedule.crew_id)
        .eq("user_id", user.id)
        .single();

      isAdmin = !!(membership?.role && ["owner", "admin"].includes(membership.role));
    }

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteSchedule(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
