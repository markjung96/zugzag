import { NextResponse } from "next/server";

import { createInvite, getCrewInvites } from "@/lib/api/invite-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/crews/[id]/invites
 * 크루의 초대 링크 목록 조회
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { invites } = await getCrewInvites(id);
    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Error fetching crew invites:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch invites" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/crews/[id]/invites
 * 초대 링크 생성
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { max_uses, expires_at } = body;

    const { invite } = await createInvite({
      crew_id: id,
      created_by: user.id,
      max_uses: max_uses || null,
      expires_at: expires_at || null,
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invite" },
      { status: 500 },
    );
  }
}
