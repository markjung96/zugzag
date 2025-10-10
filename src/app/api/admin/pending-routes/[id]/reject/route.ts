import { NextResponse } from "next/server";

import { checkAdminPermission, rejectPendingRoute } from "@/lib/api/admin-helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/pending-routes/[id]/reject
 * 검토 대기 루트 거부
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 권한 확인
  const { authorized } = await checkAdminPermission();

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reason } = body;

    const result = await rejectPendingRoute(id, reason);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error rejecting pending route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
