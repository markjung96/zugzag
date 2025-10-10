import { NextResponse } from "next/server";

import { cancelEvent } from "@/lib/api/event-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/events/[id]/cancel
 * 일정 취소
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { reason } = body;

    const result = await cancelEvent(id, reason, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error cancelling event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
