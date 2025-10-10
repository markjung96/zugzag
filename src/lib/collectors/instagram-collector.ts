/**
 * Instagram 루트 세팅 정보 수집기
 *
 * 사용 방법:
 * 1. Instagram Graph API (공식, 비즈니스 계정 필요)
 * 2. instagram-private-api (비공식, 빠르지만 불안정)
 *
 * 이 파일은 비공식 API 기준으로 작성되었습니다.
 * 프로덕션에서는 Graph API 사용을 권장합니다.
 */

import {
  parseRouteFromCaption,
  isRouteSettingPost,
  calculateCaptionQuality,
} from "../transformers/parse-caption";

export interface InstagramPost {
  id: string;
  code: string; // 게시물 단축 코드 (URL용)
  caption: string;
  imageUrl: string;
  postedAt: Date;
  likes: number;
  comments: number;
}

export interface CollectedRoute {
  instagram_post_id: string;
  instagram_url: string;
  caption: string;
  image_url: string;
  posted_at: string; // ISO string

  // 파싱 결과
  parsed_setter_name: string | null;
  parsed_difficulty: string | null;
  parsed_color: string | null;
  parsed_difficulty_normalized: number | null;
  parsed_set_date: string | null;
  parsed_wall_section: string | null;
  parsed_route_type: string | null;
  parsed_tags: string[];
  parsing_confidence: number;
}

/**
 * Instagram 게시물을 CollectedRoute로 변환
 */
export function transformInstagramPost(gymId: string, post: InstagramPost): CollectedRoute | null {
  // 루트 세팅 관련 게시물인지 확인
  if (!isRouteSettingPost(post.caption)) {
    return null;
  }

  // 캡션 파싱
  const parsed = parseRouteFromCaption(post.caption);
  const confidence = calculateCaptionQuality(parsed);

  return {
    instagram_post_id: post.id,
    instagram_url: `https://instagram.com/p/${post.code}`,
    caption: post.caption,
    image_url: post.imageUrl,
    posted_at: post.postedAt.toISOString(),

    parsed_setter_name: parsed.setter_name,
    parsed_difficulty: parsed.difficulty,
    parsed_color: parsed.color,
    parsed_difficulty_normalized: parsed.difficulty_normalized,
    parsed_set_date: parsed.set_date,
    parsed_wall_section: parsed.wall_section,
    parsed_route_type: parsed.route_type,
    parsed_tags: parsed.tags,
    parsing_confidence: confidence,
  };
}

/**
 * Instagram 계정에서 최근 게시물 수집 (비공식 API)
 *
 * 주의: 이 함수는 서버 환경에서만 실행해야 합니다.
 * 클라이언트에서 실행하면 CORS 오류가 발생합니다.
 */
export async function collectPostsFromInstagram(
  username: string,
  _maxPosts: number = 20,
): Promise<InstagramPost[]> {
  // 실제 구현은 instagram-private-api 또는 Graph API 사용
  // 여기서는 인터페이스만 정의

  throw new Error(
    "Instagram 수집기는 서버 환경에서 instagram-private-api 또는 Graph API를 사용해야 합니다. " +
      "scripts/collect-instagram.ts 또는 Supabase Edge Function을 참고하세요.",
  );
}

/**
 * 여러 암장의 Instagram 계정에서 루트 수집
 */
export async function collectRoutesFromGyms(
  gyms: Array<{ id: string; instagram_handle: string }>,
): Promise<Array<{ gymId: string; routes: CollectedRoute[] }>> {
  const results: Array<{ gymId: string; routes: CollectedRoute[] }> = [];

  for (const gym of gyms) {
    try {
      const posts = await collectPostsFromInstagram(gym.instagram_handle);
      const routes = posts
        .map((post) => transformInstagramPost(gym.id, post))
        .filter((route): route is CollectedRoute => route !== null);

      results.push({
        gymId: gym.id,
        routes,
      });
    } catch (error) {
      console.error(`Failed to collect from ${gym.instagram_handle}:`, error);
    }
  }

  return results;
}
