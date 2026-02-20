import type { Metadata } from "next";
import { CrewStatsContent } from "./stats-content";

export const metadata: Metadata = {
  title: "크루 통계 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default function CrewStatsPage() {
  return <CrewStatsContent />;
}
