/**
 * 사용자 통계 API
 * GET /api/users/me/stats - 현재 사용자의 통계 조회
 */

import { NextResponse } from "next/server";

import { getUserStats } from "@/lib/api/user-stats-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getUserStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user stats" },
      { status: 500 },
    );
  }
}
