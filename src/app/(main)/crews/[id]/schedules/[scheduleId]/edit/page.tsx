import type { Metadata } from "next"
import { EditScheduleContent } from "./edit-schedule-content"

export const metadata: Metadata = {
  title: "일정 수정 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function EditSchedulePage() {
  return <EditScheduleContent />
}
