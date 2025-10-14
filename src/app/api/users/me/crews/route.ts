import { NextResponse } from "next/server";

import { getUserCrews } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/me/crews
 * 현재 유저가 소속된 크루 목록 조회
 */
export async function GET() {
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { crews } = await getUserCrews(user.id);

    return NextResponse.json({ crews });
  } catch (error) {
    console.error("Error fetching user crews:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}


