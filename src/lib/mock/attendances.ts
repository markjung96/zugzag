/**
 * Mock 데이터: 참석 정보 (Event Attendances)
 */

export type MockAttendance = {
  id: string;
  event_id: string;
  user_id: string;
  phase_id: string | null;
  status: "attending" | "not_attending" | "maybe" | "waitlist" | "late" | "early_leave" | "no_show";
  waitlist_position: number | null;
  waitlist_promoted_at: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  user_note: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    nickname: string | null;
    climbing_level: string | null;
  };
  phase?: {
    id: string;
    phase_number: number;
    title: string;
  } | null;
};

export const mockAttendances: MockAttendance[] = [
  // Event 1 참석자들
  {
    id: "attendance-1",
    event_id: "event-1",
    user_id: "user-1",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: null,
    admin_note: null,
    created_at: "2025-10-10T11:00:00Z",
    updated_at: "2025-10-10T11:00:00Z",
    user: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
      climbing_level: "V5",
    },
  },
  {
    id: "attendance-2",
    event_id: "event-1",
    user_id: "user-2",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: "1차만 참석합니다",
    admin_note: null,
    created_at: "2025-10-10T12:00:00Z",
    updated_at: "2025-10-10T12:00:00Z",
    user: {
      id: "user-2",
      full_name: "이관리",
      avatar_url: null,
      nickname: "부크루장",
      climbing_level: "V4",
    },
  },
  {
    id: "attendance-3",
    event_id: "event-1",
    user_id: "user-4",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: null,
    admin_note: null,
    created_at: "2025-10-10T13:00:00Z",
    updated_at: "2025-10-10T13:00:00Z",
    user: {
      id: "user-4",
      full_name: "박멤버",
      avatar_url: null,
      nickname: "등린이",
      climbing_level: "V2",
    },
  },
  {
    id: "attendance-4",
    event_id: "event-1",
    user_id: "user-5",
    phase_id: null,
    status: "waitlist",
    waitlist_position: 1,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: "대기 중입니다",
    admin_note: null,
    created_at: "2025-10-11T10:00:00Z",
    updated_at: "2025-10-11T10:00:00Z",
    user: {
      id: "user-5",
      full_name: "최프로",
      avatar_url: null,
      nickname: "프로클라이머",
      climbing_level: "V8",
    },
  },
  {
    id: "attendance-5",
    event_id: "event-1",
    user_id: "user-3",
    phase_id: null,
    status: "maybe",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: "아직 확실하지 않아요",
    admin_note: null,
    created_at: "2025-10-11T11:00:00Z",
    updated_at: "2025-10-11T11:00:00Z",
    user: {
      id: "user-3",
      full_name: "이볼더",
      avatar_url: null,
      nickname: "볼더마스터",
      climbing_level: "V6",
    },
  },
  // Event 2 참석자들
  {
    id: "attendance-6",
    event_id: "event-2",
    user_id: "user-1",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: null,
    admin_note: null,
    created_at: "2025-10-08T11:00:00Z",
    updated_at: "2025-10-08T11:00:00Z",
    user: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
      climbing_level: "V5",
    },
  },
  {
    id: "attendance-7",
    event_id: "event-2",
    user_id: "user-4",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: null,
    admin_note: null,
    created_at: "2025-10-08T12:00:00Z",
    updated_at: "2025-10-08T12:00:00Z",
    user: {
      id: "user-4",
      full_name: "박멤버",
      avatar_url: null,
      nickname: "등린이",
      climbing_level: "V2",
    },
  },
  // Event 3 참석자들
  {
    id: "attendance-8",
    event_id: "event-3",
    user_id: "user-3",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: null,
    admin_note: null,
    created_at: "2025-10-05T11:00:00Z",
    updated_at: "2025-10-05T11:00:00Z",
    user: {
      id: "user-3",
      full_name: "이볼더",
      avatar_url: null,
      nickname: "볼더마스터",
      climbing_level: "V6",
    },
  },
  {
    id: "attendance-9",
    event_id: "event-3",
    user_id: "user-4",
    phase_id: null,
    status: "maybe",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: "시간 맞으면 갈게요",
    admin_note: null,
    created_at: "2025-10-05T12:00:00Z",
    updated_at: "2025-10-05T12:00:00Z",
    user: {
      id: "user-4",
      full_name: "박멤버",
      avatar_url: null,
      nickname: "등린이",
      climbing_level: "V2",
    },
  },
  // Event 4 (과거 일정) 참석자들
  {
    id: "attendance-10",
    event_id: "event-4",
    user_id: "user-1",
    phase_id: null,
    status: "attending",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: "2025-10-05T14:05:00Z",
    checked_out_at: "2025-10-05T16:10:00Z",
    user_note: null,
    admin_note: null,
    created_at: "2025-09-28T11:00:00Z",
    updated_at: "2025-10-05T16:10:00Z",
    user: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
      climbing_level: "V5",
    },
  },
  {
    id: "attendance-11",
    event_id: "event-4",
    user_id: "user-2",
    phase_id: null,
    status: "no_show",
    waitlist_position: null,
    waitlist_promoted_at: null,
    checked_in_at: null,
    checked_out_at: null,
    user_note: null,
    admin_note: "노쇼",
    created_at: "2025-09-28T12:00:00Z",
    updated_at: "2025-10-05T16:00:00Z",
    user: {
      id: "user-2",
      full_name: "이관리",
      avatar_url: null,
      nickname: "부크루장",
      climbing_level: "V4",
    },
  },
];

// 이벤트별로 참석자를 가져오는 헬퍼 함수
export function getAttendancesByEventId(eventId: string): MockAttendance[] {
  return mockAttendances.filter((a) => a.event_id === eventId);
}

// 사용자별로 참석 정보를 가져오는 헬퍼 함수
export function getAttendancesByUserId(userId: string): MockAttendance[] {
  return mockAttendances.filter((a) => a.user_id === userId);
}

