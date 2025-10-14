import { NextResponse } from "next/server";

import { joinCrew } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/crews/[id]/join
 * 크루 가입
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
    const { member } = await joinCrew(id, user.id);

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Error joining crew:", error);

    // 에러 타입에 따른 상태 코드 설정
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes("ONBOARDING_REQUIRED")) {
        statusCode = 403; // Forbidden - 프로필 완성 필요
      } else if (error.message.includes("이미") || error.message.includes("가득")) {
        statusCode = 400; // Bad Request
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: statusCode },
    );
  }
}
