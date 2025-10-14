import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateCrewData = {
  name: string;
  description?: string;
  location?: string;
  is_public?: boolean;
  max_members?: number;
  logo_url?: string;
};

type UpdateCrewData = Partial<CreateCrewData>;

async function joinCrew(crewId: string) {
  const response = await fetch(`/api/crews/${crewId}/join`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to join crew");
  }

  return response.json();
}

async function leaveCrew(crewId: string) {
  const response = await fetch(`/api/crews/${crewId}/leave`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to leave crew");
  }

  return response.json();
}

async function createCrew(data: CreateCrewData) {
  const response = await fetch("/api/crews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create crew");
  }

  return response.json();
}

async function updateCrew(id: string, data: UpdateCrewData) {
  const response = await fetch(`/api/crews/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update crew");
  }

  return response.json();
}

async function deleteCrew(id: string) {
  const response = await fetch(`/api/crews/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete crew");
  }

  return response.json();
}

export function useJoinCrewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crewId: string) => joinCrew(crewId),
    onSuccess: (_, crewId) => {
      // 크루 상세 정보 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["crew", crewId] });
      queryClient.invalidateQueries({ queryKey: ["crews"] });
    },
  });
}

export function useLeaveCrewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crewId: string) => leaveCrew(crewId),
    onSuccess: () => {
      // 크루 목록 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["crews"] });
    },
  });
}

export function useCreateCrewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCrewData) => createCrew(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crews"] });
    },
  });
}

export function useUpdateCrewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCrewData }) => updateCrew(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["crew", id] });
      queryClient.invalidateQueries({ queryKey: ["crews"] });
    },
  });
}

export function useDeleteCrewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCrew(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crews"] });
    },
  });
}

/**
 * ==============================================
 * 가입 신청 관련
 * ==============================================
 */

async function createJoinRequest(crewId: string, message?: string) {
  const response = await fetch(`/api/crews/${crewId}/join-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create join request");
  }

  return response.json();
}

async function approveJoinRequest(crewId: string, requestId: string) {
  const response = await fetch(`/api/crews/${crewId}/join-requests/${requestId}/approve`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to approve join request");
  }

  return response.json();
}

async function rejectJoinRequest(crewId: string, requestId: string) {
  const response = await fetch(`/api/crews/${crewId}/join-requests/${requestId}/reject`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reject join request");
  }

  return response.json();
}

export function useJoinRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, message }: { crewId: string; message?: string }) =>
      createJoinRequest(crewId, message),
    onSuccess: (_, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: ["crew", crewId] });
      queryClient.invalidateQueries({ queryKey: ["join-requests", crewId] });
    },
  });
}

export function useApproveJoinRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, requestId }: { crewId: string; requestId: string }) =>
      approveJoinRequest(crewId, requestId),
    onSuccess: (_, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: ["join-requests", crewId] });
      queryClient.invalidateQueries({ queryKey: ["crew", crewId] });
    },
  });
}

export function useRejectJoinRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, requestId }: { crewId: string; requestId: string }) =>
      rejectJoinRequest(crewId, requestId),
    onSuccess: (_, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: ["join-requests", crewId] });
    },
  });
}

/**
 * ==============================================
 * 멤버 관리 관련
 * ==============================================
 */

async function updateMemberRole(crewId: string, memberId: string, role: "owner" | "admin" | "member") {
  const response = await fetch(`/api/crews/${crewId}/members/${memberId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update member role");
  }

  return response.json();
}

async function removeMember(crewId: string, memberId: string) {
  const response = await fetch(`/api/crews/${crewId}/members/${memberId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to remove member");
  }

  return response.json();
}

export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, memberId, role }: { crewId: string; memberId: string; role: "owner" | "admin" | "member" }) =>
      updateMemberRole(crewId, memberId, role),
    onSuccess: (_, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: ["crew", crewId] });
    },
  });
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crewId, memberId }: { crewId: string; memberId: string }) =>
      removeMember(crewId, memberId),
    onSuccess: (_, { crewId }) => {
      queryClient.invalidateQueries({ queryKey: ["crew", crewId] });
    },
  });
}
