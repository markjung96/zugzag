import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "이용약관 | ZUGZAG",
  description:
    "ZUGZAG(줄그랙) 클라이밍 크루 출석 관리 서비스 이용약관을 확인하세요.",
  openGraph: {
    title: "이용약관 | ZUGZAG",
    description:
      "ZUGZAG(줄그랙) 클라이밍 크루 출석 관리 서비스 이용약관을 확인하세요.",
  },
}

export default function TermsPage() {
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
        <h1 className="flex-1 text-center text-lg font-bold">이용약관</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col px-4 py-8">
        <article className="mx-auto w-full max-w-lg space-y-8">
          <div>
            <h2 className="mb-2 text-2xl font-bold">ZUGZAG (줄그랙) 이용약관</h2>
            <p className="text-sm text-muted-foreground">
              클라이밍 크루 출석 관리 서비스
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              1. 서비스 이용 약관
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              회원은 ZUGZAG 서비스를 정당한 목적으로만 이용해야 합니다. 서비스
              이용 시 본 약관 및 관련 법령을 준수하여야 합니다.
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">크루장</strong>: 일정 생성,
                회원 관리, 크루 설정 등의 권한을 가지며, 크루 운영에 관한 책임을
                집니다.
              </li>
              <li>
                <strong className="text-foreground">멤버</strong>: 크루 일정
                확인, RSVP(참석 신청), 출석 확인 등을 할 수 있으며, 정확한 정보
                입력에 책임을 집니다.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              2. 이용자의 의무
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              이용자는 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>스팸, 광고, 홍보 등 부적절한 콘텐츠 게시</li>
              <li>허위 정보 입력 및 타인 사칭</li>
              <li>타인의 개인정보 무단 수집 또는 유포</li>
              <li>서비스 시스템 파괴, 해킹 등 기술적 공격</li>
              <li>기타 법령 또는 서비스 정책을 위반하는 행위</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              3. 서비스 제공 및 변경
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              ZUGZAG는 클라이밍 크루 출석 관리 서비스를 제공합니다. 서비스
              내용, 기능, 운영 방식 등은 사전 공지 후 변경될 수 있으며, 회원에게
              불이익이 발생하는 주요 변경 시에는 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              4. 면책 조항
            </h3>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                서비스는 사전 공지 없이 점검, 오류 수정, 정책 변경 등으로 인해
                일시 중단될 수 있습니다.
              </li>
              <li>
                천재지변, 네트워크 장애 등 불가피한 사유로 인한 서비스 중단에
                대해 ZUGZAG는 책임을 지지 않습니다.
              </li>
              <li>
                회원 간 또는 회원과 제3자 간 분쟁은 당사자 간 해결을 원칙으로
                하며, ZUGZAG는 이에 대해 관여하지 않습니다.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              5. 약관의 변경
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시
              서비스 내 공지를 통해 안내합니다.
            </p>
          </section>

          <div className="pt-8">
            <Link
              href="/signup"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              ← 이전으로
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
