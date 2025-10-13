/**
 * Mock 데이터: 크루 (Crews)
 */

export type MockCrew = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_public: boolean;
  max_members: number | null;
  location: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Stats
  member_count?: number;
  event_count?: number;
};

export type MockCrewMember = {
  id: string;
  crew_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  is_active: boolean;
  joined_at: string;
  // Relations
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    nickname: string | null;
  };
};

export const mockCrews: MockCrew[] = [
  {
    id: "crew-1",
    name: "서울 클라이밍 크루",
    description: "서울에서 활동하는 클라이밍 크루입니다. 초보자부터 고급자까지 모두 환영합니다!",
    logo_url: null,
    banner_url: null,
    is_public: true,
    max_members: 50,
    location: "서울 강남",
    tags: ["강남", "주말", "초보환영"],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    member_count: 23,
    event_count: 45,
  },
  {
    id: "crew-2",
    name: "강북 볼더링 모임",
    description: "강북 지역 볼더링 모임입니다. 매주 목요일 저녁에 만나요.",
    logo_url: null,
    banner_url: null,
    is_public: true,
    max_members: 30,
    location: "서울 강북",
    tags: ["강북", "볼더링", "평일"],
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
    member_count: 15,
    event_count: 28,
  },
  {
    id: "crew-3",
    name: "여성 클라이밍 모임",
    description: "여성 클라이머들의 안전하고 즐거운 모임",
    logo_url: null,
    banner_url: null,
    is_public: false,
    max_members: 20,
    location: "서울 전역",
    tags: ["여성전용", "초보환영", "주말"],
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2025-03-01T00:00:00Z",
    member_count: 18,
    event_count: 22,
  },
];

export const mockCrewMembers: MockCrewMember[] = [
  {
    id: "member-1",
    crew_id: "crew-1",
    user_id: "user-1",
    role: "owner",
    is_active: true,
    joined_at: "2025-01-01T00:00:00Z",
    user: {
      id: "user-1",
      full_name: "김크루",
      avatar_url: null,
      nickname: "크루장",
    },
  },
  {
    id: "member-2",
    crew_id: "crew-1",
    user_id: "user-2",
    role: "admin",
    is_active: true,
    joined_at: "2025-01-05T00:00:00Z",
    user: {
      id: "user-2",
      full_name: "이관리",
      avatar_url: null,
      nickname: "부크루장",
    },
  },
  {
    id: "member-3",
    crew_id: "crew-1",
    user_id: "user-4",
    role: "member",
    is_active: true,
    joined_at: "2025-02-01T00:00:00Z",
    user: {
      id: "user-4",
      full_name: "박멤버",
      avatar_url: null,
      nickname: "등린이",
    },
  },
  {
    id: "member-4",
    crew_id: "crew-2",
    user_id: "user-3",
    role: "owner",
    is_active: true,
    joined_at: "2025-02-01T00:00:00Z",
    user: {
      id: "user-3",
      full_name: "이볼더",
      avatar_url: null,
      nickname: "볼더마스터",
    },
  },
];

