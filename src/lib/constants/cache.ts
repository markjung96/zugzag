export const CACHE_TIME = {
  /** 실시간 데이터 (RSVP, 출석) - 30초 */
  realtime: 30 * 1000,
  /** 일반 데이터 (크루 목록, 일정) - 2분 */
  standard: 2 * 60 * 1000,
  /** 정적 데이터 (프로필, 통계) - 5분 */
  static: 5 * 60 * 1000,
  /** GC 시간 - 10분 */
  gc: 10 * 60 * 1000,
} as const
