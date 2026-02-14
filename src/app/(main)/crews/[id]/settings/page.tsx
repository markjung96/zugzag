import type { Metadata } from "next"
import { CrewSettingsContent } from "./settings-content"

export const metadata: Metadata = {
  title: "크루 설정 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function CrewSettingsPage() {
  return <CrewSettingsContent />
}
