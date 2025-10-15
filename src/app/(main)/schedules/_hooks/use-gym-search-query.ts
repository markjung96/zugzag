import { useQuery } from "@tanstack/react-query";

export type Gym = {
  id: string | null;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  provider: string | null;
  provider_place_id: string | null;
  distance_m: number | null;
  score: number | null;
  _external?: boolean;
};

type GymSearchParams = {
  query: string;
  lat?: number;
  lon?: number;
  limit?: number;
};

async function searchGyms(params: GymSearchParams): Promise<Gym[]> {
  const searchParams = new URLSearchParams({
    q: params.query,
    limit: (params.limit || 10).toString(),
  });

  if (params.lat !== undefined) {
    searchParams.set("lat", params.lat.toString());
  }

  if (params.lon !== undefined) {
    searchParams.set("lon", params.lon.toString());
  }

  const response = await fetch(`/api/gyms?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "암장 검색에 실패했습니다");
  }

  const data = await response.json();
  return data.results || [];
}

export function useGymSearchQuery(
  query: string,
  options?: {
    lat?: number;
    lon?: number;
    limit?: number;
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: ["gym-search", query, options?.lat, options?.lon, options?.limit],
    queryFn: () =>
      searchGyms({
        query,
        lat: options?.lat,
        lon: options?.lon,
        limit: options?.limit,
      }),
    enabled: (options?.enabled ?? true) && query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
