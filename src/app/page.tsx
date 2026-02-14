import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: "ZUGZAG - 클라이밍 크루 일정관리",
  description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요. 출석 관리, RSVP, 일정 공유까지 한곳에서.",
  openGraph: {
    title: "ZUGZAG - 클라이밍 크루 일정관리",
    description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요. 출석 관리, RSVP, 일정 공유까지 한곳에서.",
  },
}

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect("/crews")
  }

  redirect("/login")
}
