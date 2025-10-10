import { NextResponse } from "next/server";

import { checkAdminPermission, getPendingRoutes } from "@/lib/api/admin-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pending-routes
 * 검토 대기 루트 목록 조회
 */
export async function GET(req: Request) {
  // 권한 확인
  const { authorized } = await checkAdminPermission();

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 쿼리 파라미터
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending";
  const gymId = url.searchParams.get("gym_id") || undefined;
  const limit = Number(url.searchParams.get("limit") || 50);
  const offset = Number(url.searchParams.get("offset") || 0);

  try {
    const { routes, total } = await getPendingRoutes({
      status,
      gymId,
      limit,
      offset,
    });

    return NextResponse.json({
      routes,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching pending routes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
