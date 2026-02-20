export const crewStatsQueryKey = (crewId: string, days?: number) => ["crew-stats", crewId, days] as const
