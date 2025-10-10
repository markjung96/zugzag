import { NextResponse } from "next/server";

import { createEvent, getEvents } from "@/lib/api/event-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/events
 * 일정 목록 조회
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const crew_id = url.searchParams.get("crew_id") || undefined;
  const user_id = url.searchParams.get("user_id") || undefined;
  const start_date = url.searchParams.get("start_date") || undefined;
  const end_date = url.searchParams.get("end_date") || undefined;
  const status = (url.searchParams.get("status") as "upcoming" | "past" | "all") || "upcoming";
  const limit = Number(url.searchParams.get("limit") || 50);
  const offset = Number(url.searchParams.get("offset") || 0);

  try {
    const { events, total } = await getEvents({
      crew_id,
      user_id,
      start_date,
      end_date,
      status,
      limit,
      offset,
    });

    return NextResponse.json({
      events,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/events
 * 일정 생성
 */
export async function POST(req: Request) {
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
    const {
      crew_id,
      title,
      description,
      event_date,
      total_capacity,
      is_public,
      visibility,
      rsvp_deadline,
      allow_waitlist,
      reminder_hours,
      tags,
      notes,
      phases,
    } = body;

    // 필수 필드 검증
    if (!crew_id || !title || !event_date || !total_capacity) {
      return NextResponse.json(
        { error: "crew_id, title, event_date, total_capacity are required" },
        { status: 400 },
      );
    }

    if (!phases || phases.length === 0) {
      return NextResponse.json({ error: "At least one phase is required" }, { status: 400 });
    }

    // 크루 멤버십 확인
    const { data: membership } = await supabase
      .from("crew_members")
      .select("role")
      .eq("crew_id", crew_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this crew" }, { status: 403 });
    }

    // 일정 생성
    const { event } = await createEvent({
      crew_id,
      created_by: user.id,
      title,
      description,
      event_date,
      total_capacity,
      is_public,
      visibility,
      rsvp_deadline,
      allow_waitlist,
      reminder_hours,
      tags,
      notes,
      phases,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

