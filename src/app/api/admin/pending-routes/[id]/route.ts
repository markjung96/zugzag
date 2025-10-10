import { NextResponse } from "next/server";

import {
  checkAdminPermission,
  updatePendingRoute,
  deletePendingRoute,
} from "@/lib/api/admin-helpers";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/pending-routes/[id]
 * 검토 대기 루트 수정
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 권한 확인
  const { authorized } = await checkAdminPermission();

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const route = await updatePendingRoute(id, body);

    return NextResponse.json({ route });
  } catch (error) {
    console.error("Error updating pending route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/pending-routes/[id]
 * 검토 대기 루트 삭제
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 권한 확인
  const { authorized } = await checkAdminPermission();

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deletePendingRoute(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pending route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
