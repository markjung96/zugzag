import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  // 에러가 있으면 로그인 페이지로 리다이렉트
  if (error) {
    console.error("OAuth 오류:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const supabase = await createServerClient();

    try {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("세션 교환 오류:", exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=auth_callback_failed`
        );
      }

      // 로그인 성공 후 대시보드로 리다이렉트
      // TODO: 대시보드 페이지 생성 후 '/dashboard'로 변경
      return NextResponse.redirect(`${requestUrl.origin}/`);
    } catch (error) {
      console.error("OAuth 콜백 처리 오류:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=unexpected_error`
      );
    }
  }

  // code가 없으면 로그인 페이지로
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
