# 🔐 ZUGZAG 인증 시스템 가이드

## 개요

ZUGZAG는 **Supabase Auth**를 기반으로 한 안전하고 확장 가능한 인증 시스템을 사용합니다.

---

## 🏗️ 시스템 아키텍처

### 1. 인증 방식
- **JWT (JSON Web Token)** 기반 인증
- **HttpOnly 쿠키**에 토큰 저장 (XSS 공격 방지)
- **Refresh Token** 자동 갱신

### 2. 세션 관리
```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│  Browser/Client │ ◄──► │  Next.js Server  │ ◄──► │  Supabase Auth  │
│                 │      │  (Middleware)    │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │                          │
        │  1. 쿠키에 저장          │  2. 세션 검증             │  3. JWT 발급
        │  2. 자동 갱신            │  3. 보호 라우트 체크       │  4. 토큰 갱신
```

---

## 🔑 주요 기능

### 1. 회원가입 (Sign Up)
```typescript
// 이메일 회원가입
await signUpWithEmail(email, password, {
  full_name: "홍길동",
  avatar_url: "https://..."
});

// OAuth 회원가입 (Google, GitHub)
await signInWithGoogle();
await signInWithGithub();
```

**프로세스:**
1. 사용자가 이메일/비밀번호 입력
2. Supabase Auth에 사용자 생성 (`auth.users`)
3. DB 트리거가 자동으로 `profiles` 테이블에 프로필 생성
4. 이메일 인증 링크 발송
5. 사용자가 이메일 인증 완료

### 2. 로그인 (Sign In)
```typescript
// 이메일 로그인
await signInWithEmail(email, password);

// OAuth 로그인
await signInWithGoogle();
await signInWithGithub();
```

**프로세스:**
1. 자격 증명 검증
2. JWT Access Token (1시간 유효) + Refresh Token (7일 유효) 발급
3. HttpOnly 쿠키에 저장
4. 홈페이지로 리다이렉트

### 3. 로그아웃 (Sign Out)
```typescript
await signOut();
```

### 4. 비밀번호 재설정
```typescript
// 재설정 이메일 발송
await resetPassword(email);

// 새 비밀번호 설정
await supabase.auth.updateUser({
  password: newPassword
});
```

---

## 🍪 쿠키 기반 세션 관리

### 쿠키 구조
```
sb-<project-ref>-auth-token
├── access_token (JWT)
├── refresh_token
├── expires_at
└── user metadata
```

### 보안 설정
- **HttpOnly**: JavaScript로 접근 불가 (XSS 방지)
- **Secure**: HTTPS에서만 전송
- **SameSite**: CSRF 공격 방지
- **Path**: `/` (모든 경로에서 사용)

---

## 🛡️ 미들웨어 보호

`src/middleware.ts`에서 세션을 자동으로 관리합니다:

```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 모든 경로에 적용 (정적 파일 제외)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 주요 역할
1. **자동 세션 갱신**: 매 요청마다 토큰 유효성 검사 및 갱신
2. **보호 라우트**: 로그인 필요 페이지 접근 제어
3. **쿠키 동기화**: 서버-클라이언트 간 세션 상태 동기화

---

## 🗄️ 데이터베이스 구조

### 1. auth.users (Supabase 관리)
Supabase가 자동으로 관리하는 인증 정보:
- id (UUID)
- email
- encrypted_password
- email_confirmed_at
- raw_user_meta_data (추가 정보)
- created_at, updated_at

### 2. public.profiles (커스텀 프로필)
애플리케이션별 사용자 정보:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  nickname TEXT,
  bio TEXT,
  phone TEXT,
  role TEXT DEFAULT 'member',
  climbing_level TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'
);
```

### 3. 자동 프로필 생성 트리거
회원가입 시 자동으로 프로필 생성:
```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 🔒 Row Level Security (RLS)

Supabase의 RLS로 데이터 접근 제어:

### Profiles 정책
```sql
-- 모든 프로필은 조회 가능
CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (true);

-- 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 자신의 프로필만 생성 가능
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## 📱 클라이언트 사용법

### 현재 사용자 가져오기
```typescript
import { getCurrentUser } from '@/lib/auth/auth-helpers';

const user = await getCurrentUser();
if (user) {
  console.log('로그인됨:', user.email);
} else {
  console.log('로그인 필요');
}
```

### 프로필 정보 가져오기
```typescript
import { getUserProfile } from '@/lib/auth/auth-helpers';

const profile = await getUserProfile(userId);
console.log('프로필:', profile);
```

### 프로필 업데이트
```typescript
import { updateUserProfile } from '@/lib/auth/auth-helpers';

await updateUserProfile(userId, {
  nickname: '새로운닉네임',
  bio: '클라이밍 매니아',
  climbing_level: 'V5'
});
```

---

## 🔄 세션 유지 및 갱신

### 자동 갱신 메커니즘
1. **Access Token** (1시간): 짧은 유효 기간으로 보안 강화
2. **Refresh Token** (7일): 장기 세션 유지
3. 미들웨어가 매 요청마다 자동으로 토큰 검사 및 갱신

### 로그인 상태 유지
- "로그인 상태 유지" 체크박스: 브라우저 재시작 후에도 로그인 유지
- Refresh Token이 만료되기 전까지 자동 로그인

### 세션 만료 처리
```typescript
// 미들웨어에서 자동 처리
const { data: { user } } = await supabase.auth.getUser();

if (!user && isProtectedRoute) {
  // 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/login', request.url));
}
```

---

## 🎯 보안 모범 사례

### 1. 환경 변수
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 클라이언트 vs 서버
- **클라이언트 컴포넌트**: `createClient()` 사용
- **서버 컴포넌트**: `createServerClient()` 사용
- **API 라우트**: `createServerClient()` 사용

### 3. 권한 체크
```typescript
// 서버 컴포넌트에서
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>보호된 콘텐츠</div>;
}
```

---

## 🚀 다음 단계

- [ ] 2FA (Two-Factor Authentication) 추가
- [ ] 소셜 로그인 확장 (Kakao, Naver)
- [ ] 세션 활동 로그 기록
- [ ] 의심스러운 로그인 감지
- [ ] 계정 잠금 정책

---

## 📚 참고 자료

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

