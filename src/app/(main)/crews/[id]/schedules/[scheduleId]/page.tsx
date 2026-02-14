import type { Metadata } from "next"
import { ScheduleDetailContent } from "./schedule-detail-content"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; scheduleId: string }>
}): Promise<Metadata> {
  await params
  return {
    title: `일정 상세 | ZUGZAG`,
    robots: { index: false, follow: false },
  }
}

export default function ScheduleDetailPage() {
  return <ScheduleDetailContent />
}
