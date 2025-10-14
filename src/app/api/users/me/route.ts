import { NextResponse } from "next/server";

import { getCurrentUserWithProfile, updateUserProfile } from "@/lib/api/user-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/me
 * 현재 로그인한 사용자의 프로필 조회
 */
export async function GET() {
  try {
    const { user, profile } = await getCurrentUserWithProfile();

    return NextResponse.json({
      user,
      profile,
    });
  } catch (error) {
    // 비로그인 사용자는 에러 로그 출력하지 않음
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/users/me
 * 현재 로그인한 사용자의 프로필 업데이트
 */
export async function PATCH(req: Request) {
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 허용된 필드만 업데이트
    const allowedUpdates = {
      full_name: body.full_name,
      nickname: body.nickname,
      bio: body.bio,
      climbing_level: body.climbing_level,
      avatar_url: body.avatar_url,
      phone: body.phone,
    };

    // undefined 값 제거
    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { profile } = await updateUserProfile(user.id, updates);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
