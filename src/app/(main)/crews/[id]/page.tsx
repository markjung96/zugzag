import type { Metadata } from "next"
import { CrewsDetailContent } from "./crews-detail-content"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await params
  return {
    title: `크루 상세 | ZUGZAG`,
    robots: { index: false, follow: false },
  }
}

export default function CrewDetailPage() {
  return <CrewsDetailContent />
}
