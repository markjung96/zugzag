import { NextResponse } from "next/server";

import { searchKakaoPlaces } from "@/lib/kakao/places";

export const dynamic = "force-dynamic";

/**
 * GET /api/kakao/places
 * 카카오 장소 검색
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const categoryFilter = searchParams.get("category") || "all";

  if (!query) {
    return NextResponse.json({ error: "query parameter is required" }, { status: 400 });
  }

  try {
    // 카테고리 필터에 따라 검색어 조정
    let searchQuery = query;
    if (categoryFilter === "food") {
      searchQuery = `${query} 음식점`;
    } else if (categoryFilter === "cafe") {
      searchQuery = `${query} 카페`;
    }

    const result = await searchKakaoPlaces({ query: searchQuery, size: 15 });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching Kakao places:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
