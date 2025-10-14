import { useQuery } from "@tanstack/react-query";

import type { JoinRequestsResponse } from "@/lib/api/crew-helpers";

type JoinRequestsParams = {
  crewId: string;
  status?: "pending" | "approved" | "rejected";
};

async function fetchJoinRequests({ crewId, status }: JoinRequestsParams): Promise<JoinRequestsResponse> {
  const searchParams = new URLSearchParams();
  if (status) searchParams.append("status", status);

  const response = await fetch(`/api/crews/${crewId}/join-requests?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch join requests");
  }

  return response.json();
}

export function useJoinRequestsQuery({ crewId, status }: JoinRequestsParams) {
  return useQuery<JoinRequestsResponse, Error>({
    queryKey: ["join-requests", crewId, status],
    queryFn: () => fetchJoinRequests({ crewId, status }),
    enabled: !!crewId,
  });
}


