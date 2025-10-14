import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/lib/supabase/database.types";

/**
 * 유저가 소속된 크루 정보 타입
 */
export type UserCrewMembership = {
  id: string;
  role: string;
  joined_at: string | null;
  crew: Pick<
    Tables<"crews">,
    "id" | "name" | "description" | "logo_url" | "is_public" | "location"
  >;
};

type UserCrewsResponse = {
  crews: UserCrewMembership[];
};

/**
 * 현재 유저가 소속된 크루 목록 조회
 */
async function fetchUserCrews(): Promise<UserCrewsResponse> {
  const response = await fetch("/api/users/me/crews");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user crews");
  }

  return response.json();
}

export function useUserCrewsQuery() {
  return useQuery<UserCrewsResponse>({
    queryKey: ["user-crews"],
    queryFn: fetchUserCrews,
  });
}
