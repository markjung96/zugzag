import { NextResponse } from "next/server";

import { searchKakaoPlaces, transformKakaoPlaceToGym, isClimbingRelated } from "@/lib/kakao/places";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/gyms
 * 암장 검색 API (내부 DB 우선 → 외부 API fallback)
 *
 * Query Parameters:
 * - q: 검색어 (필수)
 * - lat: 사용자 위도 (선택)
 * - lon: 사용자 경도 (선택)
 * - limit: 결과 개수 (기본 10)
 * - fallback: 외부 API fallback 활성화 (기본 true)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const limit = Number(url.searchParams.get("limit") ?? 10);
    const fallback = url.searchParams.get("fallback") !== "false";

    if (!q.trim()) {
      return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1) 내부 DB 검색
    const { data: internalResults, error: searchError } = await supabase.rpc("search_gyms", {
      q,
      user_lat: lat ? Number(lat) : undefined,
      user_lon: lon ? Number(lon) : undefined,
      max_distance_km: 30,
      top_n: limit,
    });

    if (searchError) {
      console.error("Internal search error:", searchError);
      return NextResponse.json({ error: "검색 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 2) 결과가 충분하면 바로 반환
    if (!fallback || (internalResults && internalResults.length >= 3)) {
      return NextResponse.json({
        results: internalResults ?? [],
        source: "internal",
      });
    }

    // 3) 결과 부족 시 외부 API 호출 (카카오)
    try {
      const kakaoResponse = await searchKakaoPlaces({
        query: q,
        x: lon ? Number(lon) : undefined,
        y: lat ? Number(lat) : undefined,
        radius: 20000, // 20km
        size: 15,
        sort: lat && lon ? "distance" : "accuracy",
      });

      // 클라이밍 관련 장소만 필터링
      const climbingPlaces = kakaoResponse.documents.filter(isClimbingRelated);

      // 외부 결과를 내부 포맷으로 변환
      const externalResults = climbingPlaces.slice(0, limit).map((place) => {
        const gym = transformKakaoPlaceToGym(place);
        return {
          id: null, // 아직 DB에 없음
          ...gym,
          distance_m: gym.metadata?.distance ?? null,
          score: null,
          _external: true, // 외부 결과 표시
        };
      });

      // 내부 + 외부 결과 병합 (중복 제거)
      const internalIds = new Set(internalResults?.map((r) => r.provider_place_id) ?? []);
      const uniqueExternal = externalResults.filter((r) => !internalIds.has(r.provider_place_id));

      const combined = [...(internalResults ?? []), ...uniqueExternal].slice(0, limit);

      return NextResponse.json({
        results: combined,
        source: "mixed",
        external_count: uniqueExternal.length,
      });
    } catch (externalError) {
      console.error("External API error:", externalError);
      // 외부 API 실패 시 내부 결과만 반환
      return NextResponse.json({
        results: internalResults ?? [],
        source: "internal",
        warning: "외부 검색 실패",
      });
    }
  } catch (error) {
    console.error("Gym search error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
