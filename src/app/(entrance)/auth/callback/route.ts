import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  // 에러가 있으면 로그인 페이지로 리다이렉트
  if (error) {
    console.error("OAuth 오류:", error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = await createClient();

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("세션 교환 오류:", exchangeError);
        console.error("에러 상세:", {
          message: exchangeError.message,
          status: exchangeError.status,
          code: exchangeError.code,
        });
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_callback_failed&detail=${encodeURIComponent(exchangeError.message)}`,
        );
      }

      // 사용자 정보 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=user_not_found`);
      }

      // 프로필 조회
      const { data: profile } = await supabase
        .from("profiles")
        .select("climbing_level")
        .eq("id", user.id)
        .single();

      // 초대 코드 확인
      const inviteCode = requestUrl.searchParams.get("invite");

      // climbing_level이 없으면 신규 유저 → 온보딩
      // climbing_level이 있으면 기존 유저 → 대시보드
      let redirectUrl: string;
      if (!profile || !profile.climbing_level) {
        // 신규 유저 - 온보딩으로 (초대 코드 포함)
        redirectUrl = inviteCode
          ? `${requestUrl.origin}/onboarding?invite=${inviteCode}`
          : `${requestUrl.origin}/onboarding`;
      } else {
        // 기존 유저 - 대시보드로
        redirectUrl = `${requestUrl.origin}/dashboard`;
      }

      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth 콜백 처리 오류:", error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`);
    }
  }

  // code가 없으면 로그인 페이지로
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
