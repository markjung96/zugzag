import { NextResponse } from "next/server";

import { getEventAttendances } from "@/lib/api/event-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]/attendances
 * 참석자 목록 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: event_id } = await params;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;

  try {
    const { attendances } = await getEventAttendances(event_id, status);
    return NextResponse.json({ attendances });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
