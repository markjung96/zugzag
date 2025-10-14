import { NextResponse } from "next/server";

import { createCrew, getCrews } from "@/lib/api/crew-helpers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/crews
 * 크루 목록 조회
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const is_public = url.searchParams.get("is_public");
  const limit = Number(url.searchParams.get("limit") || 50);
  const offset = Number(url.searchParams.get("offset") || 0);

  try {
    const { crews, total } = await getCrews({
      search,
      is_public: is_public !== null ? is_public === "true" : undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      crews,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching crews:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/crews
 * 크루 생성
 */
export async function POST(req: Request) {
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
    const { name, description, location, is_public, max_members, logo_url } = body;

    // 필수 필드 검증
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // 크루 생성
    const { crew } = await createCrew({
      name: name.trim(),
      description,
      location,
      is_public,
      max_members,
      created_by: user.id,
      logo_url,
    });

    return NextResponse.json({ crew }, { status: 201 });
  } catch (error) {
    console.error("Error creating crew:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}


