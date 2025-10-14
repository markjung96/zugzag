import { useQuery } from "@tanstack/react-query";

import type { CrewDetailResponse } from "@/lib/api/crew-helpers";

async function fetchCrewById(id: string): Promise<CrewDetailResponse> {
  const response = await fetch(`/api/crews/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch crew");
  }

  return response.json();
}

export function useCrewDetailQuery(crewId: string) {
  return useQuery<CrewDetailResponse, Error>({
    queryKey: ["crew", crewId],
    queryFn: () => fetchCrewById(crewId),
    enabled: !!crewId,
  });
}
