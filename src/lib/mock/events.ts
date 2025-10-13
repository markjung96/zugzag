/**
 * Mock 데이터: 일정 (Events)
 */

export type MockEvent = {
  id: string;
  crew_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_date: string;
  total_capacity: number;
  is_public: boolean;
  visibility: "crew" | "link" | "public";
  rsvp_deadline: string | null;
  allow_waitlist: boolean;
  max_waitlist: number;
  is_cancelled: boolean;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancelled_reason: string | null;
  reminder_hours: number[];
  notification_sent: boolean;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  crew: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  creator: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    nickname: string | null;
  };
  phases: Array<{
    id: string;
    phase_number: number;
    title: string;
    start_time: string;
    end_time: string | null;
    gym: {
      id: string;
      name: string;
      address: string;
    } | null;
    location_text: string | null;
    capacity: number | null;
    notes: string | null;
  }>;
  stats?: {
    attending_count: number;
    waitlist_count: number;
    not_attending_count: number;
    maybe_count: number;
    checked_in_count: number;
    no_show_count: number;
    available_slots: number;
  };
};

export const mockEvents: MockEvent[] = [
  {
    id: "event-1",
    crew_id: "crew-1",
    created_by: "user-1",
    title: "주말 클라이밍 🧗",
    description: "주말에 다 같이 더클라임 강남점에서 만나요! 초보자도 환영합니다.",
    event_date: "2025-10-18",
    total_capacity: 15,
    is_public: false,
    visibility: "crew",
    rsvp_deadline: "2025-10-17T18:00:00Z",
    allow_waitlist: true,
    max_waitlist: 10,
    is_cancelled: false,
    cancelled_at: null,
    cancelled_by: null,
    cancelled_reason: null,
    reminder_hours: [24, 2],
    notification_sent: false,
    tags: ["주말", "초보환영"],
    notes: null,
    created_at: "2025-10-10T10:00:00Z",
    updated_at: "2025-10-10T10:00:00Z",
    crew: {
      id: "crew-1",
      name: "서울 클라이밍 크루",
      logo_url: null,
    },
    creator: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
    },
    phases: [
      {
        id: "phase-1",
        phase_number: 1,
        title: "1차",
        start_time: "14:00",
        end_time: "16:00",
        gym: {
          id: "gym-1",
          name: "더클라임 강남",
          address: "서울특별시 강남구 테헤란로 123",
        },
        location_text: null,
        capacity: 15,
        notes: "초보자 환영",
      },
      {
        id: "phase-2",
        phase_number: 2,
        title: "2차",
        start_time: "18:00",
        end_time: "20:00",
        gym: {
          id: "gym-2",
          name: "클라이밍파크 선릉",
          address: "서울특별시 강남구 선릉로 456",
        },
        location_text: null,
        capacity: 10,
        notes: "저녁 세션",
      },
    ],
    stats: {
      attending_count: 12,
      waitlist_count: 2,
      not_attending_count: 3,
      maybe_count: 1,
      checked_in_count: 0,
      no_show_count: 0,
      available_slots: 3,
    },
  },
  {
    id: "event-2",
    crew_id: "crew-1",
    created_by: "user-1",
    title: "평일 저녁 세션 🌙",
    description: "퇴근 후 가볍게 운동해요",
    event_date: "2025-10-15",
    total_capacity: 10,
    is_public: false,
    visibility: "crew",
    rsvp_deadline: null,
    allow_waitlist: true,
    max_waitlist: 5,
    is_cancelled: false,
    cancelled_at: null,
    cancelled_by: null,
    cancelled_reason: null,
    reminder_hours: [2],
    notification_sent: false,
    tags: ["평일", "저녁"],
    notes: null,
    created_at: "2025-10-08T10:00:00Z",
    updated_at: "2025-10-08T10:00:00Z",
    crew: {
      id: "crew-1",
      name: "서울 클라이밍 크루",
      logo_url: null,
    },
    creator: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
    },
    phases: [
      {
        id: "phase-3",
        phase_number: 1,
        title: "1차",
        start_time: "19:00",
        end_time: "21:00",
        gym: {
          id: "gym-1",
          name: "더클라임 강남",
          address: "서울특별시 강남구 테헤란로 123",
        },
        location_text: null,
        capacity: 10,
        notes: null,
      },
    ],
    stats: {
      attending_count: 8,
      waitlist_count: 0,
      not_attending_count: 2,
      maybe_count: 0,
      checked_in_count: 0,
      no_show_count: 0,
      available_slots: 2,
    },
  },
  {
    id: "event-3",
    crew_id: "crew-2",
    created_by: "user-3",
    title: "초보자 오리엔테이션 👋",
    description: "클라이밍이 처음이신 분들을 위한 입문 세션입니다",
    event_date: "2025-10-20",
    total_capacity: 8,
    is_public: true,
    visibility: "public",
    rsvp_deadline: "2025-10-19T12:00:00Z",
    allow_waitlist: true,
    max_waitlist: 5,
    is_cancelled: false,
    cancelled_at: null,
    cancelled_by: null,
    cancelled_reason: null,
    reminder_hours: [24],
    notification_sent: false,
    tags: ["초보자", "입문"],
    notes: "장비 대여 가능",
    created_at: "2025-10-05T10:00:00Z",
    updated_at: "2025-10-05T10:00:00Z",
    crew: {
      id: "crew-2",
      name: "강북 볼더링 모임",
      logo_url: null,
    },
    creator: {
      id: "user-3",
      full_name: "이볼더",
      avatar_url: null,
      nickname: "볼더마스터",
    },
    phases: [
      {
        id: "phase-4",
        phase_number: 1,
        title: "1차",
        start_time: "10:00",
        end_time: "12:00",
        gym: {
          id: "gym-3",
          name: "볼더홀릭 홍대",
          address: "서울특별시 마포구 홍익로 789",
        },
        location_text: null,
        capacity: 8,
        notes: "장비 대여 무료",
      },
    ],
    stats: {
      attending_count: 5,
      waitlist_count: 0,
      not_attending_count: 0,
      maybe_count: 2,
      checked_in_count: 0,
      no_show_count: 0,
      available_slots: 3,
    },
  },
  {
    id: "event-4",
    crew_id: "crew-1",
    created_by: "user-1",
    title: "지난 세션 📝",
    description: "지난주에 진행한 세션입니다",
    event_date: "2025-10-05",
    total_capacity: 12,
    is_public: false,
    visibility: "crew",
    rsvp_deadline: null,
    allow_waitlist: false,
    max_waitlist: 0,
    is_cancelled: false,
    cancelled_at: null,
    cancelled_by: null,
    cancelled_reason: null,
    reminder_hours: [24, 2],
    notification_sent: true,
    tags: ["완료"],
    notes: null,
    created_at: "2025-09-28T10:00:00Z",
    updated_at: "2025-09-28T10:00:00Z",
    crew: {
      id: "crew-1",
      name: "서울 클라이밍 크루",
      logo_url: null,
    },
    creator: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
    },
    phases: [
      {
        id: "phase-5",
        phase_number: 1,
        title: "1차",
        start_time: "14:00",
        end_time: "16:00",
        gym: {
          id: "gym-1",
          name: "더클라임 강남",
          address: "서울특별시 강남구 테헤란로 123",
        },
        location_text: null,
        capacity: 12,
        notes: null,
      },
    ],
    stats: {
      attending_count: 10,
      waitlist_count: 0,
      not_attending_count: 2,
      maybe_count: 0,
      checked_in_count: 9,
      no_show_count: 1,
      available_slots: 0,
    },
  },
  {
    id: "event-5",
    crew_id: "crew-1",
    created_by: "user-1",
    title: "다음주 워크샵 🎯",
    description: "리드 클라이밍 기초 워크샵",
    event_date: "2025-10-25",
    total_capacity: 6,
    is_public: false,
    visibility: "crew",
    rsvp_deadline: "2025-10-23T18:00:00Z",
    allow_waitlist: true,
    max_waitlist: 3,
    is_cancelled: false,
    cancelled_at: null,
    cancelled_by: null,
    cancelled_reason: null,
    reminder_hours: [48, 24],
    notification_sent: false,
    tags: ["워크샵", "리드"],
    notes: "리드 경험자만",
    created_at: "2025-10-10T10:00:00Z",
    updated_at: "2025-10-10T10:00:00Z",
    crew: {
      id: "crew-1",
      name: "서울 클라이밍 크루",
      logo_url: null,
    },
    creator: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
    },
    phases: [
      {
        id: "phase-6",
        phase_number: 1,
        title: "이론 세션",
        start_time: "13:00",
        end_time: "14:00",
        gym: {
          id: "gym-1",
          name: "더클라임 강남",
          address: "서울특별시 강남구 테헤란로 123",
        },
        location_text: null,
        capacity: 6,
        notes: "세미나실",
      },
      {
        id: "phase-7",
        phase_number: 2,
        title: "실습 세션",
        start_time: "14:00",
        end_time: "17:00",
        gym: {
          id: "gym-1",
          name: "더클라임 강남",
          address: "서울특별시 강남구 테헤란로 123",
        },
        location_text: null,
        capacity: 6,
        notes: "리드벽",
      },
    ],
    stats: {
      attending_count: 4,
      waitlist_count: 1,
      not_attending_count: 0,
      maybe_count: 1,
      checked_in_count: 0,
      no_show_count: 0,
      available_slots: 2,
    },
  },
];

