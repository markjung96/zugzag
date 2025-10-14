import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session
 * 현재 세션 확인
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ session: null, isValid: false });
    }

    return NextResponse.json({ session, isValid: true });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check session" },
      { status: 500 },
    );
  }
}
