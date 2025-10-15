import { useQuery } from "@tanstack/react-query";

export type KakaoPlace = {
  id: string;
  name: string;
  address: string;
  category: string;
  x?: string; // longitude
  y?: string; // latitude
};

type KakaoPlaceSearchParams = {
  query: string;
  category?: "food" | "cafe" | "all";
};

async function searchKakaoPlaces(params: KakaoPlaceSearchParams): Promise<KakaoPlace[]> {
  const response = await fetch(
    `/api/kakao/places?query=${encodeURIComponent(params.query)}&category=${params.category || "all"}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "장소 검색에 실패했습니다");
  }

  const data = await response.json();

  // any 타입 제거
  const mappedPlaces: KakaoPlace[] = (
    data.documents as Array<{
      id: string;
      place_name: string;
      road_address_name: string;
      address_name: string;
      category_name: string;
      x: string;
      y: string;
    }>
  ).map((place) => ({
    id: place.id,
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    category: place.category_name,
    x: place.x,
    y: place.y,
  }));

  return mappedPlaces;
}

export function useKakaoPlaceSearchQuery(
  query: string,
  options?: {
    category?: "food" | "cafe" | "all";
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: ["kakao-place-search", query, options?.category],
    queryFn: () =>
      searchKakaoPlaces({
        query,
        category: options?.category,
      }),
    enabled: (options?.enabled ?? true) && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
