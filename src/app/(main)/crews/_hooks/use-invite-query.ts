"use client";

import { useQuery } from "@tanstack/react-query";

import type { InvitesResponse, InviteResponse } from "@/lib/api/invite-helpers";

/**
 * 크루의 초대 링크 목록 조회
 */
async function fetchCrewInvites(crewId: string): Promise<InvitesResponse> {
  const response = await fetch(`/api/crews/${crewId}/invites`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invites");
  }

  return response.json();
}

export function useCrewInvitesQuery(crewId: string | null) {
  return useQuery<InvitesResponse, Error>({
    queryKey: ["crew-invites", crewId],
    queryFn: () => fetchCrewInvites(crewId!),
    enabled: !!crewId,
  });
}

/**
 * 초대 코드로 초대 정보 조회
 */
async function fetchInviteByCode(code: string): Promise<InviteResponse> {
  const response = await fetch(`/api/invites/${code}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invite");
  }

  return response.json();
}

export function useInviteByCodeQuery(code: string | null) {
  return useQuery<InviteResponse, Error>({
    queryKey: ["invite-code", code],
    queryFn: () => fetchInviteByCode(code!),
    enabled: !!code,
    retry: false, // 잘못된 코드는 재시도 안 함
  });
}
