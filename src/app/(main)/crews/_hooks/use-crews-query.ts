import { useQuery } from "@tanstack/react-query";

import type { CrewsResponse } from "@/lib/api/crew-helpers";

type UseCrewsQueryParams = {
  search?: string;
  is_public?: boolean;
  limit?: number;
  offset?: number;
};

async function fetchCrews(params: UseCrewsQueryParams = {}): Promise<CrewsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.is_public !== undefined) searchParams.append("is_public", params.is_public.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.offset) searchParams.append("offset", params.offset.toString());

  const response = await fetch(`/api/crews?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch crews");
  }

  return response.json();
}

export function useCrewsQuery(params: UseCrewsQueryParams = {}) {
  return useQuery<CrewsResponse, Error>({
    queryKey: ["crews", params],
    queryFn: () => fetchCrews(params),
  });
}
