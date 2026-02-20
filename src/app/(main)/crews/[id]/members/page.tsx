import type { Metadata } from "next";
import { CrewMembersContent } from "./members-content";

export const metadata: Metadata = {
  title: "크루 멤버 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default function CrewMembersPage() {
  return <CrewMembersContent />;
}
