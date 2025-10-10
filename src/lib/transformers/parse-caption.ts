/**
 * Instagram 캡션에서 루트 정보 추출
 * 예시 캡션:
 * "10월 10일 신규 세팅 🧗‍♀️
 *  세터: 김민수
 *  난이도: V4~V7
 *  A존 볼더링
 *  #루트세팅 #클라이밍 #볼더링"
 */

import { normalizeDifficulty } from "./normalize-difficulty";

export interface ParsedRouteInfo {
  setter_name: string | null;
  difficulty: string | null;
  difficulty_normalized: number | null;
  color: string | null; // 색깔 정보 추가
  set_date: string | null; // ISO date
  wall_section: string | null;
  route_type: "boulder" | "lead" | "speed" | null;
  tags: string[];
}

/**
 * 날짜 추출 (MM월 DD일, YYYY-MM-DD 등)
 */
function extractDate(caption: string): string | null {
  // "10월 10일" 형식
  const koreanDateMatch = caption.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (koreanDateMatch) {
    const month = koreanDateMatch[1].padStart(2, "0");
    const day = koreanDateMatch[2].padStart(2, "0");
    const year = new Date().getFullYear();
    return `${year}-${month}-${day}`;
  }

  // "2025-10-10" 형식
  const isoDateMatch = caption.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    return isoDateMatch[0];
  }

  // "10/10" 형식
  const slashDateMatch = caption.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDateMatch) {
    const month = slashDateMatch[1].padStart(2, "0");
    const day = slashDateMatch[2].padStart(2, "0");
    const year = new Date().getFullYear();
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * 세터 이름 추출
 */
function extractSetter(caption: string): string | null {
  // "세터: 김민수" 또는 "세터 김민수"
  const setterMatch = caption.match(/세터[:\s]*([가-힣]{2,4})/);
  if (setterMatch) {
    return setterMatch[1];
  }

  // "Setter: John Doe"
  const englishSetterMatch = caption.match(/setter[:\s]*([A-Za-z\s]{3,20})/i);
  if (englishSetterMatch) {
    return englishSetterMatch[1].trim();
  }

  return null;
}

/**
 * 색깔 키워드 목록 (한국어/영어)
 * 난이도 매핑은 하지 않고, 색깔만 추출
 */
const COLOR_KEYWORDS = [
  // 한국어
  "흰색",
  "노란색",
  "주황색",
  "초록색",
  "파란색",
  "보라색",
  "빨간색",
  "검은색",
  "분홍색",
  "회색",
  "갈색",
  "하늘색",
  "남색",
  "연두색",
  "자주색",
  "청록색",
  // 영어
  "white",
  "yellow",
  "orange",
  "green",
  "blue",
  "purple",
  "red",
  "black",
  "pink",
  "gray",
  "grey",
  "brown",
  "skyblue",
  "navy",
  "lime",
  "cyan",
];

/**
 * 색깔 추출 (난이도 매핑 없이 색깔만 추출)
 * 암장마다 색깔 체계가 다르므로, 관리자가 나중에 매핑
 */
function extractColor(caption: string): string | null {
  const lower = caption.toLowerCase();

  for (const color of COLOR_KEYWORDS) {
    if (lower.includes(color.toLowerCase())) {
      return color;
    }
  }

  return null;
}

/**
 * 난이도 추출 (색깔 + V-scale, 난이도는 관리자가 나중에 매핑)
 */
function extractDifficulty(caption: string): {
  difficulty: string | null;
  normalized: number | null;
  color: string | null;
} {
  const color = extractColor(caption);

  // 1. V-scale 범위: "V4~V7"
  const vRangeMatch = caption.match(/V(\d+)\s*[~\-–—]\s*V?(\d+)/i);
  if (vRangeMatch) {
    const min = parseInt(vRangeMatch[1], 10);
    const max = parseInt(vRangeMatch[2], 10);
    const avg = Math.round((min + max) / 2);
    return {
      difficulty: `V${min}~V${max}`,
      normalized: normalizeDifficulty(`V${avg}`).normalized,
      color,
    };
  }

  // 2. 단일 V-scale: "V4"
  const vMatch = caption.match(/V(\d+)/i);
  if (vMatch) {
    const grade = `V${vMatch[1]}`;
    return {
      difficulty: grade,
      normalized: normalizeDifficulty(grade).normalized,
      color,
    };
  }

  // 3. YDS: "5.11a"
  const ydsMatch = caption.match(/5\.(\d+)([a-d])?/i);
  if (ydsMatch) {
    const grade = `5.${ydsMatch[1]}${ydsMatch[2] || ""}`;
    return {
      difficulty: grade,
      normalized: normalizeDifficulty(grade).normalized,
      color,
    };
  }

  // 4. 색깔만 있는 경우 (난이도는 null, 관리자가 매핑)
  if (color) {
    return {
      difficulty: color,
      normalized: null, // 관리자가 나중에 설정
      color,
    };
  }

  return { difficulty: null, normalized: null, color: null };
}

/**
 * 벽 섹션 추출 (A존, B존, 리드월 등)
 */
function extractWallSection(caption: string): string | null {
  // "A존", "B존"
  const zoneMatch = caption.match(/([A-Z])존/);
  if (zoneMatch) {
    return `${zoneMatch[1]}존`;
  }

  // "리드월 1", "볼더링 존"
  const wallMatch = caption.match(/(리드|볼더링|스피드)\s*(존|벽)\s*(\d+)?/);
  if (wallMatch) {
    return wallMatch[0];
  }

  return null;
}

/**
 * 루트 타입 추출
 */
function extractRouteType(caption: string): "boulder" | "lead" | "speed" | null {
  const lower = caption.toLowerCase();

  if (lower.includes("볼더링") || lower.includes("boulder")) {
    return "boulder";
  }

  if (lower.includes("리드") || lower.includes("lead")) {
    return "lead";
  }

  if (lower.includes("스피드") || lower.includes("speed")) {
    return "speed";
  }

  return null;
}

/**
 * 해시태그 추출
 */
function extractHashtags(caption: string): string[] {
  const hashtags = caption.match(/#[가-힣a-zA-Z0-9_]+/g);
  return hashtags ? hashtags.map((tag) => tag.slice(1)) : [];
}

/**
 * 메인 파싱 함수
 */
export function parseRouteFromCaption(caption: string): ParsedRouteInfo {
  const { difficulty, normalized, color } = extractDifficulty(caption);

  return {
    setter_name: extractSetter(caption),
    difficulty,
    difficulty_normalized: normalized,
    color,
    set_date: extractDate(caption),
    wall_section: extractWallSection(caption),
    route_type: extractRouteType(caption),
    tags: extractHashtags(caption),
  };
}

/**
 * 캡션이 루트 세팅 관련인지 확인
 */
export function isRouteSettingPost(caption: string): boolean {
  const keywords = [
    "루트세팅",
    "신규세팅",
    "새로운루트",
    "세팅완료",
    "route setting",
    "new routes",
    "#루트세팅",
    "#신규세팅",
  ];

  const lower = caption.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

/**
 * 캡션 품질 점수 (0~100)
 * 정보가 많을수록 높은 점수
 */
export function calculateCaptionQuality(parsed: ParsedRouteInfo): number {
  let score = 0;

  if (parsed.setter_name) score += 25;
  if (parsed.difficulty) score += 30;
  if (parsed.set_date) score += 20;
  if (parsed.wall_section) score += 15;
  if (parsed.route_type) score += 10;

  return score;
}
