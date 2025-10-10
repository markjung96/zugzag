import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/gyms/upsert
 * 외부 장소 선택 시 내부 DB에 캐싱 (upsert)
 *
 * Body:
 * {
 *   name: string;
 *   address?: string;
 *   latitude?: number;
 *   longitude?: number;
 *   phone?: string;
 *   website?: string;
 *   provider: 'kakao' | 'naver' | 'google';
 *   provider_place_id: string;
 *   metadata?: object;
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      address,
      latitude,
      longitude,
      phone,
      website,
      provider,
      provider_place_id,
      metadata,
    } = body;

    // 필수 필드 검증
    if (!name || !provider || !provider_place_id) {
      return NextResponse.json(
        { error: "name, provider, provider_place_id는 필수입니다." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 현재 사용자 확인 (선택: 로그인 사용자만 허용)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // upsert 실행 (service_role 권한 필요 시 서버 클라이언트 사용)
    const { data: gym, error: upsertError } = await supabase
      .from("gyms")
      .upsert(
        {
          name,
          address: address ?? null,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          phone: phone ?? null,
          website: website ?? null,
          provider,
          provider_place_id,
          is_active: true,
          popularity_score: 0,
          metadata: metadata ?? {},
        },
        {
          onConflict: "provider,provider_place_id",
          ignoreDuplicates: false, // 중복 시 업데이트
        },
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Gym upsert error:", upsertError);
      return NextResponse.json({ error: "장소 저장 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      gym,
    });
  } catch (error) {
    console.error("Gym upsert error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
