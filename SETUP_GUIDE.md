# ZUGZAG 설정 완료 가이드 🎯

## 📋 구현 완료 항목

✅ **데이터베이스 스키마 설계** (클라이밍 크루 앱용)
✅ **Google OAuth 로그인 구현**
✅ **GitHub OAuth 로그인 구현**  
✅ **이메일/비밀번호 로그인 구현**
✅ **랜딩 페이지 애니메이션**
✅ **로그인 페이지 UI**

---

## 🚀 설정해야 할 것

### 1️⃣ Supabase에서 제공해야 하는 값

아래 2가지 값만 있으면 됩니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**찾는 방법:**

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. Settings → API 메뉴
4. `Project URL`과 `anon public` 키 복사

👉 **자세한 가이드:** `ENV_SETUP.md` 파일 참조

---

### 2️⃣ Google OAuth 설정 (추가)

Google 로그인을 사용하려면:

1. **Google Cloud Console 설정**
   - OAuth Client ID/Secret 생성
   - Redirect URI 설정

2. **Supabase에 Google OAuth 연결**
   - Client ID와 Client Secret 입력

👉 **자세한 가이드:** `GOOGLE_LOGIN_SETUP.md` 파일 참조

---

### 3️⃣ 데이터베이스 마이그레이션

데이터베이스 테이블을 생성하려면:

**방법 1: Supabase Dashboard 사용 (추천)**

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. `RUN` 버튼 클릭

**방법 2: Supabase CLI 사용**

```bash
supabase db push
```

---

## 📊 데이터베이스 구조

### 생성되는 테이블:

| 테이블              | 설명                                          |
| ------------------- | --------------------------------------------- |
| `profiles`          | 사용자 프로필 (이메일, 이름, 아바타, 역할 등) |
| `crews`             | 크루 정보 (이름, 설명, 로고)                  |
| `crew_members`      | 크루 멤버십 (크루-유저 관계)                  |
| `climbing_sessions` | 클라이밍 세션 기록                            |
| `activity_logs`     | 활동 로그                                     |

### 주요 기능:

✅ **자동 프로필 생성**: 회원가입 시 자동으로 profiles 테이블에 생성
✅ **Row Level Security**: 데이터 보안 정책 적용
✅ **타임스탬프 자동 관리**: created_at, updated_at 자동 업데이트

---

## 🔧 로컬 개발 시작하기

### 1. 환경 변수 설정

`.env.local` 파일 생성:

```bash
# 프로젝트 루트에서
touch .env.local
```

`.env.local` 파일에 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 패키지 설치 및 실행

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 3. 브라우저에서 확인

http://localhost:3000 접속

---

## 🎨 구현된 기능

### 랜딩 페이지

- 4단계 애니메이션 시퀀스
  1. 로고 스플래시
  2. 캐릭터 인트로
  3. 기능 소개
  4. CTA (시작하기 버튼)
- 배경 그리드 패턴
- 떠다니는 파티클 효과
- 부드러운 전환 애니메이션

### 로그인 페이지

- 이메일/비밀번호 로그인
- Google OAuth 로그인
- GitHub OAuth 로그인
- 로딩 상태 표시
- 에러 메시지 표시
- 반응형 디자인

---

## 📝 인증 흐름

```
1. 사용자가 "Google로 로그인" 클릭
   ↓
2. Google 로그인 페이지로 리다이렉트
   ↓
3. 사용자가 Google 계정으로 로그인
   ↓
4. /auth/callback으로 리다이렉트 (code 포함)
   ↓
5. code를 session으로 교환
   ↓
6. profiles 테이블에 자동으로 사용자 생성 (트리거)
   ↓
7. 홈페이지로 리다이렉트 (로그인 완료)
```

---

## 🔒 보안 기능

✅ **Row Level Security (RLS)** 활성화
✅ **사용자는 자신의 데이터만 수정 가능**
✅ **크루 멤버만 크루 정보 조회 가능**
✅ **민감한 키는 환경 변수로 관리**

---

## 🐛 문제 해결

### "Invalid API key" 오류

→ `.env.local` 파일의 Supabase 키 확인
→ 개발 서버 재시작 (Ctrl+C 후 `pnpm dev`)

### "redirect_uri_mismatch" 오류

→ Google Cloud Console의 Redirect URI 확인
→ Supabase 프로젝트 URL이 정확한지 확인

### 로그인 후 프로필이 생성되지 않음

→ 데이터베이스 마이그레이션 실행 확인
→ Supabase Dashboard → Database → Tables에서 profiles 테이블 확인

---

## 📚 다음 단계

로그인이 완료되면 다음을 구현할 수 있습니다:

1. **대시보드 페이지** (`/dashboard`)
2. **프로필 페이지** (`/profile`)
3. **크루 생성/관리** (`/crews`)
4. **클라이밍 세션 기록** (`/sessions`)
5. **크루원 관리** (`/crews/[id]/members`)

---

## 📞 도움이 필요하면

- `ENV_SETUP.md` - 환경 변수 설정
- `GOOGLE_LOGIN_SETUP.md` - Google OAuth 상세 가이드
- `supabase/migrations/001_initial_schema.sql` - 데이터베이스 스키마

---

## ✨ 완료!

설정을 마치면 멋진 클라이밍 크루 관리 앱을 사용할 수 있습니다! 🎉
