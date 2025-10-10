import { NextResponse } from "next/server";

import {
  checkAdminPermission,
  updateColorMapping,
  deleteColorMapping,
} from "@/lib/api/admin-helpers";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/color-mappings/[id]
 * 색깔 매핑 수정
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
    const { mapping } = await updateColorMapping(id, body);

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error("Error updating color mapping:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/color-mappings/[id]
 * 색깔 매핑 삭제
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 권한 확인
  const { authorized } = await checkAdminPermission();

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteColorMapping(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting color mapping:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
