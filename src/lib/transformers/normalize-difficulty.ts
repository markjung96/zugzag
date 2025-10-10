/**
 * 난이도 정규화 유틸리티
 * V-scale, YDS, Font scale 등을 0~100 정규화 점수로 변환
 */

export type DifficultyScale = "v-scale" | "yds" | "font" | "unknown";

export interface NormalizedDifficulty {
  original: string;
  normalized: number; // 0~100
  scale: DifficultyScale;
}

/**
 * V-scale (볼더링): V0~V17
 * 정규화: V0 = 10, V17 = 95
 */
function normalizeVScale(grade: string): number | null {
  const match = grade.match(/V(\d+)/i);
  if (!match) return null;

  const level = parseInt(match[1], 10);
  return Math.min(10 + level * 5, 95);
}

/**
 * YDS (리드): 5.5~5.15d
 * 정규화: 5.5 = 10, 5.15d = 95
 */
function normalizeYDS(grade: string): number | null {
  const match = grade.match(/5\.(\d+)([a-d])?/i);
  if (!match) return null;

  const level = parseInt(match[1], 10);
  const subGrade = match[2] ? match[2].charCodeAt(0) - 96 : 0; // a=1, b=2, c=3, d=4

  const base = (level - 5) * 8;
  const sub = subGrade * 2;

  return Math.min(10 + base + sub, 95);
}

/**
 * Font scale (유럽): 4~9c
 * 정규화: 4 = 10, 9c = 95
 */
function normalizeFontScale(grade: string): number | null {
  const match = grade.match(/(\d)([a-c])?(\+)?/i);
  if (!match) return null;

  const level = parseInt(match[1], 10);
  const subGrade = match[2] ? match[2].charCodeAt(0) - 96 : 0; // a=1, b=2, c=3
  const plus = match[3] ? 1 : 0;

  const base = (level - 4) * 15;
  const sub = subGrade * 5;

  return Math.min(10 + base + sub + plus, 95);
}

/**
 * 난이도 문자열을 정규화된 숫자로 변환
 */
export function normalizeDifficulty(grade: string): NormalizedDifficulty {
  const trimmed = grade.trim();

  // V-scale 시도
  const vScore = normalizeVScale(trimmed);
  if (vScore !== null) {
    return {
      original: trimmed,
      normalized: vScore,
      scale: "v-scale",
    };
  }

  // YDS 시도
  const ydsScore = normalizeYDS(trimmed);
  if (ydsScore !== null) {
    return {
      original: trimmed,
      normalized: ydsScore,
      scale: "yds",
    };
  }

  // Font scale 시도
  const fontScore = normalizeFontScale(trimmed);
  if (fontScore !== null) {
    return {
      original: trimmed,
      normalized: fontScore,
      scale: "font",
    };
  }

  // 인식 실패
  return {
    original: trimmed,
    normalized: 50, // 기본값 (중간 난이도)
    scale: "unknown",
  };
}

/**
 * 난이도 범위 문자열 파싱 (예: "V4~V7", "5.10a-5.11c")
 */
export function parseDifficultyRange(range: string): {
  min: number;
  max: number;
} | null {
  const separators = /[~\-–—]/;
  const parts = range.split(separators).map((s) => s.trim());

  if (parts.length !== 2) return null;

  const min = normalizeDifficulty(parts[0]).normalized;
  const max = normalizeDifficulty(parts[1]).normalized;

  return { min, max };
}

/**
 * 정규화된 점수를 V-scale로 역변환 (표시용)
 */
export function denormalizeToVScale(normalized: number): string {
  const level = Math.round((normalized - 10) / 5);
  return `V${Math.max(0, Math.min(level, 17))}`;
}

/**
 * 난이도 색상 코드 (UI용)
 */
export function getDifficultyColor(normalized: number): string {
  if (normalized < 20) return "#10b981"; // green (쉬움)
  if (normalized < 40) return "#3b82f6"; // blue (중하)
  if (normalized < 60) return "#f59e0b"; // orange (중상)
  if (normalized < 80) return "#ef4444"; // red (어려움)
  return "#8b5cf6"; // purple (매우 어려움)
}

/**
 * 난이도 레이블 (UI용)
 */
export function getDifficultyLabel(normalized: number): string {
  if (normalized < 20) return "입문";
  if (normalized < 40) return "초급";
  if (normalized < 60) return "중급";
  if (normalized < 80) return "고급";
  return "전문가";
}
