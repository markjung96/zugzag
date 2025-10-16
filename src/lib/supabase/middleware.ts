import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import type { Database } from "./database.types";
import type { NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    const pathname = request.nextUrl.pathname;

    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.next({ request });
    }

    // 1. Public Routes - 항상 허용
    const publicRoutes = ["/", "/api/health"];
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next({ request });
    }

    // 2. Supabase 클라이언트 생성
    let supabaseResponse = NextResponse.next({ request });
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // 3. 세션 새로고침 및 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 4. Auth Routes - 로그인 사용자는 대시보드로 리다이렉트
    const authRoutes = ["/login", "/signup", "/forgot-password", "/resend-verification"];
    if (authRoutes.some((route) => pathname.startsWith(route))) {
      if (user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    // 5. Auth Callback Routes - 특수 처리 (체크 없이 통과)
    if (pathname.startsWith("/auth/")) {
      return supabaseResponse;
    }

    // 6. Protected Routes - 로그인 필요
    const protectedRoutes = ["/dashboard", "/crews", "/schedules", "/profile", "/admin"];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute) {
      // 6-1. 로그인 체크
      if (!user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // 6-2. Admin 권한 체크
      if (pathname.startsWith("/admin")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role && profile.role === "owner") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      // 6-3. 온보딩 체크 (Admin, Onboarding 페이지 제외)
      if (!pathname.startsWith("/admin") && pathname !== "/onboarding") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("climbing_level")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.climbing_level) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    }

    // 7. Onboarding Route - 로그인 필요 + 온보딩 미완료만 접근
    if (pathname === "/onboarding") {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("climbing_level")
        .eq("id", user.id)
        .single();

      // 이미 온보딩 완료
      if (profile?.climbing_level) {
        console.log(`[Middleware] Onboarding already completed for user ${user.id}`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // 에러가 발생해도 요청을 계속 진행
    return NextResponse.next({ request });
  }
};
