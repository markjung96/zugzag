import { NextResponse } from "next/server";

import { joinCrewByInvite } from "@/lib/api/invite-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/invites/[code]/join
 * 초대 링크로 크루 가입
 */
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;
    const { member, crew } = await joinCrewByInvite(code, user.id);

    return NextResponse.json({ member, crew }, { status: 201 });
  } catch (error) {
    console.error("Error joining crew by invite:", error);

    // 에러 타입에 따른 상태 코드 설정
    let statusCode = 400;
    if (error instanceof Error && error.message.includes("ONBOARDING_REQUIRED")) {
      statusCode = 403; // Forbidden - 프로필 완성 필요
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to join crew" },
      { status: statusCode },
    );
  }
}
