import type { Metadata } from "next";
import { NewScheduleContent } from "./new-schedule-content";

export const metadata: Metadata = {
  title: "새 일정 만들기 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default function NewSchedulePage() {
  return <NewScheduleContent />;
}
