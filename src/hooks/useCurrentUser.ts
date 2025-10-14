import { useQuery } from "@tanstack/react-query";

import type { CurrentUserWithProfile } from "@/lib/api/user-helpers";

export interface CurrentUserResponse {
  user: CurrentUserWithProfile["user"];
  profile: CurrentUserWithProfile["profile"];
}

async function fetchCurrentUser(): Promise<CurrentUserResponse | null> {
  const response = await fetch("/api/users/me");

  if (!response.ok) {
    if (response.status === 401) {
      // 인증되지 않은 경우 null 반환 (에러 대신)
      return null;
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch current user");
  }

  return response.json();
}

/**
 * 현재 로그인한 사용자 정보 조회 (auth + profile)
 */
export function useCurrentUser() {
  return useQuery<CurrentUserResponse | null, Error>({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    retry: false, // 인증 실패시 재시도하지 않음
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });
}
