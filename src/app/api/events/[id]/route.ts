import { NextResponse } from "next/server";

import { getEventById, updateEvent, deleteEvent } from "@/lib/api/event-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]
 * 일정 상세 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { event } = await getEventById(id);
    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/events/[id]
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
    // 이벤트 소유권 확인
    const { data: event } = await supabase
      .from("events")
      .select("created_by, crew_id")
      .eq("id", id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 생성자이거나 크루 관리자인지 확인
    const isCreator = event.created_by === user.id;
    const { data: membership } = await supabase
      .from("crew_members")
      .select("role")
      .eq("crew_id", event.crew_id)
      .eq("user_id", user.id)
      .single();

    const isAdmin = membership?.role && ["owner", "admin"].includes(membership.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updatedEvent = await updateEvent(id, body);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/events/[id]
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
    // 이벤트 소유권 확인
    const { data: event } = await supabase
      .from("events")
      .select("created_by, crew_id")
      .eq("id", id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 생성자이거나 크루 관리자인지 확인
    const isCreator = event.created_by === user.id;
    const { data: membership } = await supabase
      .from("crew_members")
      .select("role")
      .eq("crew_id", event.crew_id)
      .eq("user_id", user.id)
      .single();

    const isAdmin = membership?.role && ["owner", "admin"].includes(membership.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteEvent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
