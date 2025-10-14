import { NextResponse } from "next/server";

import { getInviteByCode } from "@/lib/api/invite-helpers";

/**
 * GET /api/invites/[code]
 * 초대 코드로 초대 정보 조회 (공개 API - 인증 불필요)
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { invite } = await getInviteByCode(code);
    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch invite" },
      { status: 404 },
    );
  }
}
