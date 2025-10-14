import { NextResponse } from "next/server";

import { getCrewAllStats } from "@/lib/api/crew-stats-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/crews/[id]/stats
 * 크루 통계 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 크루 멤버십 확인 (멤버만 통계 조회 가능)
    const { data: membership } = await supabase
      .from("crew_members")
      .select("*")
      .eq("crew_id", id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden: Not a crew member" }, { status: 403 });
    }

    // 통계 조회
    const stats = await getCrewAllStats(id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching crew stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
