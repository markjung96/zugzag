/**
 * Mock 데이터: 사용자 (Users/Profiles)
 */

export type MockUser = {
  id: string;
  email: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  climbing_level: string | null;
  preferred_gyms: string[];
  created_at: string;
  updated_at: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    email: "crew@zugzag.com",
    full_name: "김크루",
    nickname: "크루장",
    avatar_url: null,
    bio: "서울 클라이밍 크루 운영 중입니다",
    climbing_level: "V5",
    preferred_gyms: ["gym-1", "gym-2"],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "admin@zugzag.com",
    full_name: "이관리",
    nickname: "부크루장",
    avatar_url: null,
    bio: "크루 운영진입니다",
    climbing_level: "V4",
    preferred_gyms: ["gym-1"],
    created_at: "2025-01-05T00:00:00Z",
    updated_at: "2025-01-05T00:00:00Z",
  },
  {
    id: "user-3",
    email: "boulder@zugzag.com",
    full_name: "이볼더",
    nickname: "볼더마스터",
    avatar_url: null,
    bio: "볼더링 좋아합니다",
    climbing_level: "V6",
    preferred_gyms: ["gym-3"],
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
  {
    id: "user-4",
    email: "member@zugzag.com",
    full_name: "박멤버",
    nickname: "등린이",
    avatar_url: null,
    bio: "클라이밍 배우는 중입니다!",
    climbing_level: "V2",
    preferred_gyms: ["gym-1", "gym-2"],
    created_at: "2025-02-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  },
  {
    id: "user-5",
    email: "pro@zugzag.com",
    full_name: "최프로",
    nickname: "프로클라이머",
    avatar_url: null,
    bio: "프로 클라이머",
    climbing_level: "V8",
    preferred_gyms: ["gym-1", "gym-2", "gym-3"],
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  },
];

// 현재 로그인한 사용자 (데모용)
export const currentUser: MockUser = mockUsers[0]; // 크루장으로 기본 설정

