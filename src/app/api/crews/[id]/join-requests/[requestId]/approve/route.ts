import { NextResponse } from "next/server";

import { approveJoinRequest } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/crews/[id]/join-requests/[requestId]/approve
 * 가입 신청 승인 (관리자 전용)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> },
) {
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, requestId } = await params;

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

    const { request } = await approveJoinRequest(requestId, user.id);

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Error approving join request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      {
        status:
          error instanceof Error &&
          (error.message.includes("찾을 수 없습니다") || error.message.includes("이미"))
            ? 400
            : 500,
      },
    );
  }
}
