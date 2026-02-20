import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | ZUGZAG",
  description: "ZUGZAG(줄그랙) 클라이밍 크루 출석 관리 서비스 개인정보 처리방침을 확인하세요.",
  openGraph: {
    title: "개인정보처리방침 | ZUGZAG",
    description: "ZUGZAG(줄그랙) 클라이밍 크루 출석 관리 서비스 개인정보 처리방침을 확인하세요.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-safe">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background px-4">
        <Link
          href="/signup"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold">개인정보 처리방침</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col px-4 py-8">
        <article className="mx-auto w-full max-w-lg space-y-8">
          <div>
            <h2 className="mb-2 text-2xl font-bold">ZUGZAG (줄그랙)</h2>
            <p className="text-sm text-muted-foreground">클라이밍 크루 출석 관리 서비스</p>
          </div>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">1. 수집하는 개인정보</h3>
            <p className="text-muted-foreground leading-relaxed">
              ZUGZAG는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>이메일 주소</li>
              <li>이름(닉네임)</li>
              <li>프로필 이미지</li>
              <li>OAuth 제공자 정보 (Google, 카카오 등 로그인 시)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">2. 개인정보의 이용 목적</h3>
            <p className="text-muted-foreground leading-relaxed">수집된 개인정보는 다음 목적으로만 이용됩니다.</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>회원 관리 (가입, 인증, 탈퇴)</li>
              <li>크루 관리 (가입, 초대, 권한)</li>
              <li>출석 관리 (일정 RSVP, 출석 확인)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">3. 개인정보의 보관 기간</h3>
            <p className="text-muted-foreground leading-relaxed">
              개인정보는 회원 탈퇴 시까지 보관되며, 탈퇴 후에는 관련 법령에 따라 필요한 범위 내에서만 보관됩니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">4. 개인정보의 제3자 제공</h3>
            <p className="text-muted-foreground leading-relaxed">
              ZUGZAG는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, OAuth 로그인(Google, 카카오 등) 이용 시
              해당 제공자의 정책이 적용될 수 있습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">5. 이용자의 권리</h3>
            <p className="text-muted-foreground leading-relaxed">
              이용자는 자신의 개인정보에 대해 다음과 같은 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>조회: 프로필 페이지에서 본인 정보 확인</li>
              <li>수정: 프로필 설정에서 정보 변경 요청</li>
              <li>삭제: 회원 탈퇴를 통한 개인정보 삭제 요청</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">6. 연락처</h3>
            <p className="text-muted-foreground leading-relaxed">
              개인정보 처리방침 및 개인정보 보호에 관한 문의사항은 앱 내 프로필 페이지의 앱 정보 또는 서비스 운영자에게
              문의해 주세요.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">7. 개정</h3>
            <p className="text-muted-foreground leading-relaxed">
              본 개인정보 처리방침은 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>

          <div className="pt-8">
            <Link href="/signup" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              ← 이전으로
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
