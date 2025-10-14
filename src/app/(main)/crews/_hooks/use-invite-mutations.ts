"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 초대 링크 생성
 */
async function createInvite(data: { crewId: string; max_uses?: number; expires_at?: string }) {
  const response = await fetch(`/api/crews/${data.crewId}/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_uses: data.max_uses,
      expires_at: data.expires_at,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create invite");
  }

  return response.json();
}

export function useCreateInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvite,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crew-invites", variables.crewId] });
    },
  });
}

/**
 * 초대 링크 삭제
 */
async function deleteInvite(data: { crewId: string; inviteId: string }) {
  const response = await fetch(`/api/crews/${data.crewId}/invites/${data.inviteId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete invite");
  }

  return response.json();
}

export function useDeleteInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvite,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crew-invites", variables.crewId] });
    },
  });
}

/**
 * 초대 링크 수정
 */
async function updateInvite(data: {
  crewId: string;
  inviteId: string;
  updates: { max_uses?: number; expires_at?: string };
}) {
  const response = await fetch(`/api/crews/${data.crewId}/invites/${data.inviteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update invite");
  }

  return response.json();
}

export function useUpdateInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvite,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crew-invites", variables.crewId] });
    },
  });
}

/**
 * 초대 링크로 크루 가입
 */
async function joinByInvite(inviteCode: string) {
  const response = await fetch(`/api/invites/${inviteCode}/join`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to join crew");
  }

  return response.json();
}

export function useJoinByInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinByInvite,
    onSuccess: (data) => {
      // 크루 상세 및 멤버십 쿼리 무효화
      if (data.crew) {
        queryClient.invalidateQueries({ queryKey: ["crew", data.crew.id] });
        queryClient.invalidateQueries({ queryKey: ["user-crews"] });
      }
    },
  });
}
