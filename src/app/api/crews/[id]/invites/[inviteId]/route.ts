import { NextResponse } from "next/server";

import { deleteInvite, updateInvite } from "@/lib/api/invite-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/crews/[id]/invites/[inviteId]
 * 초대 링크 수정
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; inviteId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteId } = await params;
    const body = await request.json();
    const { invite } = await updateInvite(inviteId, body);

    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Error updating invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update invite" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/crews/[id]/invites/[inviteId]
 * 초대 링크 삭제
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; inviteId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteId } = await params;
    await deleteInvite(inviteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete invite" },
      { status: 500 },
    );
  }
}
