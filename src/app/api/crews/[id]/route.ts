import { NextResponse } from "next/server";

import { getCrewById, updateCrew, deleteCrew } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/crews/[id]
 * 크루 상세 조회
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;

  try {
    const { crew, membership } = await getCrewById(id, user?.id);

    return NextResponse.json({
      crew,
      membership,
    });
  } catch (error) {
    console.error("Error fetching crew:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/crews/[id]
 * 크루 정보 수정
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const { name, description, location, is_public, max_members, logo_url } = body;

    // 업데이트할 필드만 포함
    const updates: {
      name?: string;
      description?: string;
      location?: string;
      is_public?: boolean;
      max_members?: number;
      logo_url?: string;
    } = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (is_public !== undefined) updates.is_public = is_public;
    if (max_members !== undefined) updates.max_members = max_members;
    if (logo_url !== undefined) updates.logo_url = logo_url;

    // 크루 수정
    const { crew } = await updateCrew(id, updates);

    return NextResponse.json({ crew });
  } catch (error) {
    console.error("Error updating crew:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/crews/[id]
 * 크루 삭제
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    // owner 권한 확인
    const { data: membership } = await supabase
      .from("crew_members")
      .select("role")
      .eq("crew_id", id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership || !membership.role || membership.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Owner role required" }, { status: 403 });
    }

    // 크루 삭제
    await deleteCrew(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting crew:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
