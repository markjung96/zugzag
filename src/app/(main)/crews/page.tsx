import type { Metadata } from "next"
import { CrewsContent } from "./crews-content"

export const metadata: Metadata = {
  title: "내 크루 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function CrewsPage() {
  return <CrewsContent />
}
