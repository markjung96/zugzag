# Zugzag

Next.js 15, TypeScript, Supabase로 구축된 풀스택 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4
- **데이터베이스**: Supabase
- **패키지 매니저**: pnpm
- **코드 품질**: ESLint, Prettier, Husky, Commitlint

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- pnpm 8 이상

### 설치

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 키를 입력하세요
```

### 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 사용 가능한 스크립트

- `pnpm dev` - 개발 서버 실행 (Turbopack)
- `pnpm build` - 프로덕션 빌드
- `pnpm start` - 프로덕션 서버 실행
- `pnpm lint` - ESLint 실행
- `pnpm lint:fix` - ESLint 자동 수정
- `pnpm format` - Prettier로 코드 포맷팅
- `pnpm format:check` - Prettier 포맷 체크
- `pnpm type-check` - TypeScript 타입 체크

## 프로젝트 구조

```
zugzag/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   │   └── api/          # API 라우트
│   ├── components/       # 재사용 가능한 컴포넌트
│   ├── hooks/            # 커스텀 React Hooks
│   ├── lib/              # 라이브러리 설정
│   │   └── supabase/     # Supabase 클라이언트
│   ├── types/            # TypeScript 타입 정의
│   ├── utils/            # 유틸리티 함수
│   └── styles/           # 전역 스타일
├── public/               # 정적 파일
└── ...config files       # 설정 파일들
```

## Supabase 설정

이 프로젝트는 Supabase를 사용합니다. 다음 파일에서 Supabase 클라이언트를 가져올 수 있습니다:

- `src/lib/supabase/client.ts` - 클라이언트 컴포넌트용
- `src/lib/supabase/server.ts` - 서버 컴포넌트/액션용
- `src/lib/supabase/middleware.ts` - 미들웨어용

## 코드 스타일

### ESLint 규칙

- `_`로 시작하는 변수는 unused 경고가 무시됩니다
- import 문이 자동으로 정렬됩니다
- type import는 자동으로 `import type`으로 변환됩니다

### Commitlint

커밋 메시지는 Conventional Commits 규칙을 따릅니다:

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 기타 변경사항
```

### Husky Hooks

- **commit-msg**: 커밋 메시지 형식 검증
- **pre-push**: 빌드 테스트 실행

## Vercel 배포

이 프로젝트는 Vercel에 최적화되어 있습니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/zugzag)

환경 변수를 설정하는 것을 잊지 마세요:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 라이선스

MIT
