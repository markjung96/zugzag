import { NextResponse } from "next/server";

import { leaveCrew } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/crews/[id]/leave
 * 크루 탈퇴
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await leaveCrew(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving crew:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("크루장") ? 403 : 500 },
    );
  }
}
