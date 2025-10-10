# 🔐 인증 시스템 구현 완료

## 📦 구현된 기능

### ✅ 1. 데이터베이스 스키마 (General Purpose)

클라이밍 크루 관리 앱에 최적화된 스키마:

#### **주요 테이블:**

**`profiles`** - 사용자 프로필

- 기본 정보: 이메일, 이름, 아바타
- 추가 정보: 닉네임, 바이오, 전화번호, 클라이밍 레벨
- 역할 시스템: admin, leader, member
- 메타데이터 JSON 필드 (확장 가능)

**`crews`** - 크루 정보

- 크루 기본 정보
- 공개/비공개 설정
- 최대 인원 설정

**`crew_members`** - 크루 멤버십

- 크루-유저 다대다 관계
- 역할: owner, admin, member

**`climbing_sessions`** - 클라이밍 기록

- 위치, 난이도, 시간
- 사진 저장 (JSON)
- 크루별 세션 연결

**`activity_logs`** - 활동 로그

- 감사 추적용
- 모든 중요 활동 기록

#### **보안 기능:**

✅ Row Level Security (RLS) 적용
✅ 자동 트리거 (프로필 자동 생성)
✅ 타임스탬프 자동 관리
✅ 인덱스 최적화

---

### ✅ 2. Google OAuth 로그인

**구현 완료:**

- Google OAuth 2.0 인증
- 자동 프로필 생성
- 세션 관리
- 에러 핸들링

**파일:**

- `src/lib/auth/auth-helpers.ts` - 인증 헬퍼 함수
- `src/app/auth/callback/route.ts` - OAuth 콜백 핸들러
- `src/app/login/page.tsx` - 로그인 UI

---

### ✅ 3. 추가 로그인 방식

**이메일/비밀번호 로그인**

- 전통적인 이메일 로그인
- 비밀번호 재설정 기능

**GitHub OAuth 로그인**

- GitHub 계정으로 로그인
- Google과 동일한 흐름

---

### ✅ 4. 회원가입 및 비밀번호 관리

**회원가입 페이지** (`/signup`)

- 이메일/비밀번호 회원가입
- Google/GitHub 소셜 가입
- 폼 유효성 검사
- 이메일 인증

**비밀번호 찾기** (`/forgot-password`)

- 이메일로 재설정 링크 발송
- 안전한 토큰 기반 인증

**비밀번호 재설정** (`/auth/reset-password`)

- 토큰 유효성 검사
- 새 비밀번호 설정

---

## 🎯 당신이 제공해야 하는 값

### 필수 (2개):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**찾는 방법:**

1. Supabase Dashboard
2. Settings → API
3. 2개 복사

### 선택 (Google OAuth용):

1. **Google Cloud Console에서:**
   - OAuth Client ID
   - OAuth Client Secret
   - Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

2. **Supabase Dashboard에서:**
   - Authentication → Providers → Google
   - Client ID/Secret 입력

---

## 📂 생성된 파일 구조

```
zugzag/
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   └── auth-helpers.ts          # ✨ 인증 헬퍼 함수
│   │   └── supabase/
│   │       └── database.types.ts        # ✨ DB 타입 정의 (업데이트)
│   └── app/
│       ├── auth/
│       │   ├── callback/
│       │   │   └── route.ts             # ✨ OAuth 콜백 핸들러
│       │   └── reset-password/
│       │       └── page.tsx             # ✨ 비밀번호 재설정 페이지
│       ├── login/
│       │   └── page.tsx                 # ✨ 로그인 페이지
│       ├── signup/
│       │   └── page.tsx                 # ✨ 회원가입 페이지
│       └── forgot-password/
│           └── page.tsx                 # ✨ 비밀번호 찾기 페이지
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # ✨ DB 스키마
│
├── docs/
│   └── AUTH_SYSTEM.md                   # 📖 인증 시스템 상세 문서
├── QUICK_START.md                       # ⚡ 빠른 시작 (1분)
├── SETUP_GUIDE.md                       # 📚 상세 가이드
├── GOOGLE_LOGIN_SETUP.md                # 🔧 Google OAuth 가이드
└── ENV_SETUP.md                         # 🔑 환경 변수 가이드
```

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2️⃣ 데이터베이스 마이그레이션

Supabase Dashboard → SQL Editor:

- `supabase/migrations/001_initial_schema.sql` 내용 복사
- SQL Editor에 붙여넣기
- RUN 클릭

### 3️⃣ 실행

```bash
pnpm install
pnpm dev
```

→ http://localhost:3000

---

## 🔧 인증 함수 사용법

### 회원가입

```typescript
import { signUpWithEmail } from "@/lib/auth/auth-helpers";

// 이메일 회원가입
await signUpWithEmail(email, password, {
  full_name: "홍길동",
  avatar_url: "https://...",
});
```

### 로그인

```typescript
import { signInWithEmail, signInWithGoogle, signInWithGithub } from "@/lib/auth/auth-helpers";

// 이메일 로그인
await signInWithEmail(email, password);

// Google 로그인
await signInWithGoogle();

// GitHub 로그인
await signInWithGithub();
```

### 비밀번호 재설정

```typescript
import { resetPassword } from "@/lib/auth/auth-helpers";

// 재설정 이메일 발송
await resetPassword(email);
```

### 현재 사용자 가져오기

```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";

const user = await getCurrentUser();
```

### 프로필 업데이트

```typescript
import { updateUserProfile } from "@/lib/auth/auth-helpers";

await updateUserProfile(userId, {
  nickname: "클라이머",
  climbing_level: "V5",
});
```

### 로그아웃

```typescript
import { signOut } from "@/lib/auth/auth-helpers";

await signOut();
```

---

## 📊 데이터베이스 타입 사용

```typescript
import type { Database } from "@/lib/supabase/database.types";
import type { Tables } from "@/lib/supabase/database.types";

// 프로필 타입
type Profile = Tables<"profiles">;

// 크루 타입
type Crew = Tables<"crews">;

// Insert 타입
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
```

---

## 🎨 UI 컴포넌트

### 로그인 버튼

```tsx
<button onClick={handleGoogleLogin}>Google로 로그인</button>
```

### 로딩 상태

```tsx
{
  isLoading && <Loader2 className="animate-spin" />;
}
```

### 에러 메시지

```tsx
{
  error && <div className="text-red-400">{error}</div>;
}
```

---

## 🔐 보안 정책 (RLS)

### Profiles

- ✅ 모든 프로필은 공개 조회 가능
- ✅ 본인 프로필만 수정 가능

### Crews

- ✅ 공개 크루는 누구나 조회 가능
- ✅ 크루 멤버만 비공개 크루 조회 가능
- ✅ 오너/관리자만 크루 수정 가능

### Climbing Sessions

- ✅ 본인 세션만 CRUD 가능
- ✅ 같은 크루 멤버는 조회 가능

---

## 📝 다음 단계

이제 다음을 구현할 수 있습니다:

1. **보호된 라우트**

   ```typescript
   // middleware.ts에 인증 체크 추가
   ```

2. **대시보드**

   ```typescript
   // /dashboard 페이지
   const user = await getCurrentUser();
   const profile = await getUserProfile(user.id);
   ```

3. **크루 관리**
   ```typescript
   // 크루 생성, 멤버 추가 등
   ```

---

## 🐛 문제 해결

### 환경 변수 오류

```bash
# .env.local 확인
cat .env.local

# 서버 재시작
# Ctrl+C 후
pnpm dev
```

### OAuth 오류

- Google Cloud Console의 Redirect URI 확인
- Supabase의 Client ID/Secret 확인

### 프로필 생성 안 됨

- SQL 마이그레이션 실행 확인
- `handle_new_user()` 트리거 확인

---

## ✨ 구현 완료 체크리스트

- [x] 데이터베이스 스키마 설계
- [x] Google OAuth 구현
- [x] GitHub OAuth 구현
- [x] 이메일 로그인 구현
- [x] 이메일 회원가입 구현
- [x] 비밀번호 찾기/재설정 구현
- [x] 자동 프로필 생성
- [x] Row Level Security
- [x] 타입 정의
- [x] 에러 핸들링
- [x] 로딩 상태
- [x] 쿠키 기반 세션 관리
- [x] 미들웨어 세션 갱신
- [x] 설정 가이드 문서
- [x] 인증 시스템 상세 문서

---

## 📞 상세 가이드

더 자세한 정보가 필요하면:

- **인증 시스템 상세**: `docs/AUTH_SYSTEM.md` ⭐ **NEW!**
- **빠른 시작**: `QUICK_START.md`
- **전체 가이드**: `SETUP_GUIDE.md`
- **Google 설정**: `GOOGLE_LOGIN_SETUP.md`
- **환경 변수**: `ENV_SETUP.md`

---

## 🎉 완성!

이제 완전한 인증 시스템이 작동합니다!

### 구현된 페이지:
- ✅ `/login` - 로그인 (이메일/Google/GitHub)
- ✅ `/signup` - 회원가입
- ✅ `/forgot-password` - 비밀번호 찾기
- ✅ `/auth/reset-password` - 비밀번호 재설정
- ✅ `/auth/callback` - OAuth 콜백 핸들러

### 보안 기능:
- ✅ JWT 토큰 기반 인증
- ✅ HttpOnly 쿠키 (XSS 방지)
- ✅ 자동 세션 갱신
- ✅ Row Level Security
- ✅ 이메일 인증

필요한 건 Supabase URL과 KEY 2개뿐입니다. 🚀

---

## 🔐 인증 시스템 동작 방식

### 1. 세션 관리 (쿠키 기반)
- JWT Access Token (1시간 유효)
- Refresh Token (7일 유효)
- HttpOnly 쿠키에 안전하게 저장
- 미들웨어가 자동으로 세션 갱신

### 2. 재로그인
- Refresh Token이 유효한 동안 자동 로그인 유지
- "로그인 상태 유지" 옵션으로 장기 세션 가능
- 브라우저 재시작 후에도 로그인 상태 유지

### 3. 로그인 상태 유지
- 쿠키에 토큰 저장으로 자동 관리
- 미들웨어가 매 요청마다 세션 검증
- 토큰 만료 전 자동 갱신

더 자세한 정보는 `docs/AUTH_SYSTEM.md`를 참고하세요! 📖
