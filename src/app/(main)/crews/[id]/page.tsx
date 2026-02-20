import type { Metadata } from "next";
import { CrewsDetailContent } from "./crews-detail-content";

// TODO: Add prefetchQuery for crewQueryKey(crewId) and crewSchedulesQueryKey(crewId)
// Use CrewService.getCrew and getUserCrewSchedulesQuery from @/lib/queries/
// Note: requires crewId from params and userId from auth()
// Pattern: same as crews/page.tsx but with dynamic crewId from params

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await params;
  return {
    title: `크루 상세 | ZUGZAG`,
    robots: { index: false, follow: false },
  };
}

export default function CrewDetailPage() {
  return <CrewsDetailContent />;
}
