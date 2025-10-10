import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import type { Database } from "./database.types";
import type { NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.next({
        request,
      });
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANT: 세션 새로고침
    const {
      data: { user: _user },
    } = await supabase.auth.getUser();

    // 보호된 라우트에 대한 인증 체크 로직 추가 가능
    // if (!_user && request.nextUrl.pathname.startsWith('/protected')) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // 에러가 발생해도 요청을 계속 진행
    return NextResponse.next({
      request,
    });
  }
};
