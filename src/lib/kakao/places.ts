/**
 * 카카오 로컬 API 통합 유틸리티
 * @see https://developers.kakao.com/docs/latest/ko/local/dev-guide
 */

export type KakaoPlace = {
  id: string; // 장소 ID
  place_name: string; // 장소명
  category_name: string; // 카테고리 (예: 스포츠,레저 > 클라이밍)
  category_group_code: string; // 카테고리 그룹 코드
  category_group_name: string; // 카테고리 그룹명
  phone: string; // 전화번호
  address_name: string; // 전체 지번 주소
  road_address_name: string; // 전체 도로명 주소
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string; // 장소 상세페이지 URL
  distance: string; // 중심좌표까지의 거리 (단위: meter)
};

export type KakaoPlacesResponse = {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
    same_name: {
      region: string[];
      keyword: string;
      selected_region: string;
    } | null;
  };
  documents: KakaoPlace[];
};

export type SearchPlacesParams = {
  query: string;
  x?: number; // 중심 경도
  y?: number; // 중심 위도
  radius?: number; // 반경(m), 최대 20000
  page?: number; // 페이지 번호 (1~45)
  size?: number; // 한 페이지에 보여질 문서 수 (1~15)
  sort?: "accuracy" | "distance"; // 정렬 방식
};

/**
 * 카카오 로컬 API로 장소 검색
 */
export async function searchKakaoPlaces(params: SearchPlacesParams): Promise<KakaoPlacesResponse> {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error("KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");

  // 쿼리 파라미터 구성
  url.searchParams.set("query", params.query);
  if (params.x !== undefined) url.searchParams.set("x", params.x.toString());
  if (params.y !== undefined) url.searchParams.set("y", params.y.toString());
  if (params.radius) url.searchParams.set("radius", params.radius.toString());
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.size) url.searchParams.set("size", params.size.toString());
  if (params.sort) url.searchParams.set("sort", params.sort);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
    next: { revalidate: 300 }, // 5분 캐시
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`카카오 API 오류: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * 카카오 장소 → 내부 Gym 포맷 변환
 */
export function transformKakaoPlaceToGym(place: KakaoPlace) {
  return {
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    latitude: parseFloat(place.y),
    longitude: parseFloat(place.x),
    phone: place.phone || null,
    website: place.place_url || null,
    provider: "kakao" as const,
    provider_place_id: place.id,
    metadata: {
      category: place.category_name,
      distance: place.distance ? parseInt(place.distance, 10) : null,
    },
  };
}

/**
 * 클라이밍/볼더링 관련 키워드 필터
 */
export function isClimbingRelated(place: KakaoPlace): boolean {
  const keywords = [
    "클라이밍",
    "볼더링",
    "암장",
    "더클라임",
    "클라임",
    "climb",
    "boulder",
    "클라이밍파크",
  ];

  const text = `${place.place_name} ${place.category_name}`.toLowerCase();

  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
