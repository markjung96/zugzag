import { NextResponse } from "next/server";

import { getCrewMembers } from "@/lib/api/crew-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/crews/[id]/members
 * 크루 멤버 목록 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = new URL(req.url);
  const is_active = url.searchParams.get("is_active");

  const { id } = await params;

  try {
    const { members } = await getCrewMembers(
      id,
      is_active !== null ? is_active === "true" : undefined,
    );

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching crew members:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
