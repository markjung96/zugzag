import type { Metadata } from "next"
import { NewCrewContent } from "./new-crew-content"

export const metadata: Metadata = {
  title: "새 크루 만들기 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function NewCrewPage() {
  return <NewCrewContent />
}
