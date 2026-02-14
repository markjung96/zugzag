import type { Metadata } from "next"
import { JoinCrewContent } from "./join-crew-content"

export const metadata: Metadata = {
  title: "크루 참가 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function JoinCrewPage() {
  return <JoinCrewContent />
}
