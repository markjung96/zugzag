import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const inviteCode = requestUrl.searchParams.get("invite");

  /* eslint-disable no-console */
  // 디버깅용 로그 (docs/auth/EMAIL_AUTH_DEBUG_GUIDE.md 참고)
  console.log("🔹 [콜백 시작]");
  console.log("URL:", requestUrl.href);
  console.log("code:", code ? `존재 (${code.substring(0, 10)}...)` : "없음");
  console.log("error:", error);
  console.log("invite:", inviteCode);

  // 에러가 있으면 로그인 페이지로 리다이렉트
  if (error) {
    console.error("❌ [OAuth 오류]:", error);

    // 에러 상세 정보 가져오기
    const errorDescription = requestUrl.searchParams.get("error_description");
    const errorCode = requestUrl.searchParams.get("error_code");

    console.error("에러 코드:", errorCode);
    console.error("에러 설명:", errorDescription);

    // OTP 만료 에러 처리
    if (errorCode === "otp_expired" || error === "otp_expired") {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=otp_expired&detail=${encodeURIComponent(errorDescription || "이메일 링크가 만료되었습니다")}`,
      );
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error)}&detail=${encodeURIComponent(errorDescription || "")}`,
    );
  }

  if (code) {
    const supabase = await createClient();

    try {
      console.log("📤 [세션 교환 시작] code를 세션으로 교환");

      const { data: sessionData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("❌ [세션 교환 오류]:", exchangeError);
        console.error("에러 상세:", {
          message: exchangeError.message,
          status: exchangeError.status,
          code: exchangeError.code,
        });
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_callback_failed&detail=${encodeURIComponent(exchangeError.message)}`,
        );
      }

      console.log("✅ [세션 교환 성공]");
      console.log("세션 정보:", {
        user_id: sessionData?.user?.id,
        email: sessionData?.user?.email,
        expires_at: sessionData?.session?.expires_at,
      });

      // 사용자 정보 확인
      console.log("📤 [사용자 확인 시작]");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("❌ [사용자 없음] getUser() 실패");
        return NextResponse.redirect(`${requestUrl.origin}/login?error=user_not_found`);
      }

      console.log("✅ [사용자 확인 완료]");
      console.log("사용자 ID:", user.id);
      console.log("이메일:", user.email);
      console.log("이메일 인증 시간:", user.email_confirmed_at);

      // 프로필 조회
      console.log("📤 [프로필 조회 시작]");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("climbing_level")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ [프로필 조회 오류]:", profileError);
      } else {
        console.log("✅ [프로필 조회 성공]");
        console.log("climbing_level:", profile?.climbing_level);
      }

      // climbing_level이 없으면 신규 유저 → 온보딩
      // climbing_level이 있으면 기존 유저 → 대시보드
      let redirectUrl: string;
      if (!profile || !profile.climbing_level) {
        // 신규 유저 - 온보딩으로 (초대 코드 포함)
        redirectUrl = inviteCode
          ? `${requestUrl.origin}/onboarding?invite=${inviteCode}`
          : `${requestUrl.origin}/onboarding`;
        console.log("🆕 [신규 유저] 온보딩으로 이동");
      } else {
        // 기존 유저 - 대시보드로
        redirectUrl = `${requestUrl.origin}/dashboard`;
        console.log("👤 [기존 유저] 대시보드로 이동");
      }

      console.log("📍 [리다이렉트]:", redirectUrl);
      console.log("🔹 [콜백 종료]");
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ [OAuth 콜백 처리 오류]:", error);

      if (error instanceof Error) {
        console.error("에러 메시지:", error.message);
        console.error("에러 스택:", error.stack);
      }

      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`);
    }
  }

  // code가 없으면 로그인 페이지로
  console.log("⚠️  [경고] code 파라미터 없음");
  /* eslint-enable no-console */
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
