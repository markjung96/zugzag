import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 | ZUGZAG",
  description:
    "ZUGZAG에 회원가입하고 클라이밍 크루 일정 관리를 시작하세요. 이메일, Google, 카카오로 간편 가입할 수 있습니다.",
  openGraph: {
    title: "회원가입 | ZUGZAG",
    description:
      "ZUGZAG에 회원가입하고 클라이밍 크루 일정 관리를 시작하세요. 이메일, Google, 카카오로 간편 가입할 수 있습니다.",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
