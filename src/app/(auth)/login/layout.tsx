import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "로그인 | ZUGZAG",
  description:
    "ZUGZAG에 로그인하여 클라이밍 크루 일정 관리를 시작하세요. 이메일, Google, 카카오 로그인을 지원합니다.",
  openGraph: {
    title: "로그인 | ZUGZAG",
    description:
      "ZUGZAG에 로그인하여 클라이밍 크루 일정 관리를 시작하세요. 이메일, Google, 카카오 로그인을 지원합니다.",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
