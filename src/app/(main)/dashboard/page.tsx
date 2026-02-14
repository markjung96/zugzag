import type { Metadata } from "next"
import { DashboardContent } from "./dashboard-content"

export const metadata: Metadata = {
  title: "대시보드 | ZUGZAG",
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <DashboardContent />
}
