import { NextResponse } from "next/server";

import {
  checkAdminPermission,
  getColorMappings,
  createColorMapping,
} from "@/lib/api/admin-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/color-mappings
 * 색깔 매핑 목록 조회
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const gymId = url.searchParams.get("gym_id") || undefined;

  try {
    const { mappings } = await getColorMappings(gymId);
    return NextResponse.json({ mappings });
  } catch (error) {
    console.error("Error fetching color mappings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/color-mappings
 * 색깔 매핑 생성
 */
export async function POST(req: Request) {
  // 권한 확인
  const { authorized, user } = await checkAdminPermission();

  if (!authorized || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gym_id, color, difficulty_normalized, difficulty_label, notes } = body;

    if (!gym_id || !color || difficulty_normalized === undefined) {
      return NextResponse.json(
        { error: "gym_id, color, difficulty_normalized are required" },
        { status: 400 },
      );
    }

    const { mapping } = await createColorMapping({
      gym_id,
      color,
      difficulty_normalized,
      difficulty_label,
      notes,
      created_by: user.id,
    });

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error("Error creating color mapping:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
