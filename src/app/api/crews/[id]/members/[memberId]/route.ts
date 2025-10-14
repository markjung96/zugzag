import { NextResponse } from "next/server";

import { updateMemberRole, removeMember } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/crews/[id]/members/[memberId]
 * 멤버 역할 변경 (관리자 전용)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await params;

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

    const body = await req.json();
    const { role } = body;

    if (!role || !["owner", "admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // owner 역할은 owner만 변경 가능
    if (role === "owner" && membership.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Only owner can assign owner role" },
        {
          status: 403,
        },
      );
    }

    const { member } = await updateMemberRole(memberId, role);

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/crews/[id]/members/[memberId]
 * 멤버 강제 탈퇴 (관리자 전용)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const supabase = await createClient();

  // 권한 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await params;

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

    // 대상 멤버 정보 확인
    const { data: targetMember } = await supabase
      .from("crew_members")
      .select("role, user_id")
      .eq("id", memberId)
      .single();

    // owner는 강제 탈퇴시킬 수 없음
    if (targetMember?.role === "owner") {
      return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
    }

    // 자기 자신은 탈퇴시킬 수 없음 (일반 탈퇴 사용)
    if (targetMember?.user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself. Use leave endpoint instead" },
        { status: 400 },
      );
    }

    await removeMember(memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
