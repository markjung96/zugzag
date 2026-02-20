import type { Metadata } from "next";
import { SchedulesContent } from "./schedules-content";

// TODO: Add prefetchQuery for schedulesQueryKey() (no limit)
// Use getUserSchedulesQuery from @/lib/queries/schedules.queries
// Pattern: same as dashboard/page.tsx

export const metadata: Metadata = {
  title: "일정 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default function SchedulesPage() {
  return <SchedulesContent />;
}
