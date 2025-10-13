/**
 * Mock 데이터 통합 Export
 */

export * from "./events";
export * from "./crews";
export * from "./users";
export * from "./attendances";

// Mock 데이터 사용 여부를 환경 변수로 제어
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

