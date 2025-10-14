import { NextResponse } from "next/server";

import { createJoinRequest, getJoinRequests } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/crews/[id]/join-requests
 * 크루 가입 신청 목록 조회 (관리자 전용)
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    // 관리자 권한 확인
    const { data: membership } = await supabase
      .from("crew_members")
      .select("role")
      .eq("crew_id", id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership || !membership.role || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    // 상태 필터
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as "pending" | "approved" | "rejected" | null;

    const { requests } = await getJoinRequests(id, status || undefined);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching join requests:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/crews/[id]/join-requests
 * 크루 가입 신청 생성
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
    const body = await req.json();
    const { message } = body;

    const { request } = await createJoinRequest({
      crew_id: id,
      user_id: user.id,
      message,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Error creating join request:", error);

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
