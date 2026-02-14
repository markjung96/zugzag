import type { Metadata } from "next"
import { SchedulesContent } from "./schedules-content"

export const metadata: Metadata = {
  title: "일정 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function SchedulesPage() {
  return <SchedulesContent />
}
