# 🔐 인증 시스템 FAQ

## 자주 묻는 질문들

---

## 📱 기본 사용법

### Q1. 사용자가 로그인되어 있는지 확인하려면?

```typescript
import { getCurrentUser } from "@/lib/auth/auth-helpers";

// 서버 컴포넌트
export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>환영합니다, {user.email}</div>;
}

// 클라이언트 컴포넌트
"use client";

const [user, setUser] = useState(null);

useEffect(() => {
  getCurrentUser().then(setUser);
}, []);
```

---

### Q2. 로그인 후 특정 페이지로 리다이렉트하려면?

```typescript
// 로그인 페이지에서
const searchParams = useSearchParams();
const redirect = searchParams.get('redirect') || '/';

await signInWithEmail(email, password);
router.push(redirect);

// 보호된 페이지에서 로그인 페이지로 보낼 때
router.push('/login?redirect=/dashboard');
```

---

### Q3. 프로필 정보를 가져오려면?

```typescript
import { getUserProfile } from "@/lib/auth/auth-helpers";

const user = await getCurrentUser();
if (user) {
  const profile = await getUserProfile(user.id);
  console.log(profile.nickname, profile.climbing_level);
}
```

---

## 🛡️ 보안 관련

### Q4. 세션은 얼마나 유지되나요?

- **Access Token**: 1시간 유효
- **Refresh Token**: 7일 유효
- 미들웨어가 자동으로 갱신하므로 사용 중에는 만료되지 않음
- 7일간 접속이 없으면 다시 로그인 필요

---

### Q5. 로그인 상태 유지는 어떻게 동작하나요?

현재는 기본적으로 쿠키에 저장되므로:
- 브라우저를 닫아도 Refresh Token이 유효하면 로그인 유지
- 시크릿 모드에서는 브라우저 닫으면 로그아웃
- 명시적으로 로그아웃하면 모든 토큰 삭제

---

### Q6. 비밀번호는 안전하게 저장되나요?

네, Supabase Auth가 자동으로 처리합니다:
- bcrypt 해싱 사용
- Salt 추가로 보안 강화
- 평문 비밀번호는 절대 저장되지 않음
- DB에는 암호화된 해시만 저장

---

## 🔧 고급 사용법

### Q7. 특정 권한(role)을 가진 사용자만 접근하게 하려면?

```typescript
// 서버 컴포넌트
import { getCurrentUser, getUserProfile } from "@/lib/auth/auth-helpers";

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  if (!user) redirect("/login");
  
  const profile = await getUserProfile(user.id);
  
  if (profile?.role !== "admin") {
    return <div>권한이 없습니다</div>;
  }
  
  return <div>관리자 페이지</div>;
}
```

---

### Q8. 미들웨어에서 보호된 라우트를 설정하려면?

`src/middleware.ts`를 수정:

```typescript
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // 보호된 라우트 체크
  const protectedPaths = ["/dashboard", "/profile", "/crews"];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath) {
    // 쿠키에서 세션 확인
    const sessionCookie = request.cookies.get("sb-access-token");
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  return response;
}
```

---

### Q9. 소셜 로그인 후 추가 정보를 입력받으려면?

```typescript
// /auth/callback/route.ts를 수정

// 신규 사용자인지 확인
const { data: profile } = await supabase
  .from("profiles")
  .select("nickname")
  .eq("id", user.id)
  .single();

if (!profile?.nickname) {
  // 닉네임이 없으면 온보딩 페이지로
  return NextResponse.redirect(`${origin}/onboarding`);
}

return NextResponse.redirect(`${origin}/`);
```

---

### Q10. 사용자의 마지막 접속 시간을 기록하려면?

```typescript
// middleware.ts에 추가

import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // 세션이 있으면 last_seen_at 업데이트
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id);
  }
  
  return response;
}
```

---

## 🐛 문제 해결

### Q11. "Missing Supabase environment variables" 오류가 나요

```bash
# .env.local 파일이 있는지 확인
cat .env.local

# 없다면 생성
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local

# 서버 재시작
pnpm dev
```

---

### Q12. 로그인 후 리다이렉트가 안 돼요

```typescript
// next.config.ts에 리다이렉트 설정 확인

export default {
  async redirects() {
    return [
      // OAuth 콜백 후 자동 리다이렉트는 /auth/callback에서 처리
    ];
  },
};
```

---

### Q13. 프로필이 자동 생성되지 않아요

Supabase Dashboard에서:
1. SQL Editor 열기
2. 트리거 확인:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```
3. 없다면 `001_initial_schema.sql` 다시 실행

---

### Q14. OAuth 로그인 시 "redirect_uri_mismatch" 오류

Google Cloud Console에서:
- Redirect URI에 다음 추가:
  - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback` (개발용)

---

### Q15. 이메일 인증 링크가 오지 않아요

Supabase Dashboard:
1. Authentication → Email Templates
2. "Confirm Signup" 템플릿 확인
3. SMTP 설정 확인 (Settings → Auth)
4. 개발 중에는 Supabase Dashboard → Authentication → Users에서 수동 인증 가능

---

## 💡 팁 & 트릭

### Tip 1: 서버/클라이언트 컴포넌트에서 올바른 클라이언트 사용

```typescript
// 서버 컴포넌트
import { createClient } from "@/lib/supabase/server";

// 클라이언트 컴포넌트
import { createClient } from "@/lib/supabase/client";
```

---

### Tip 2: 로그인 폼 자동완성 개선

```tsx
<input
  type="email"
  autoComplete="email"
  name="email"
/>

<input
  type="password"
  autoComplete="current-password"
  name="password"
/>
```

---

### Tip 3: 로딩 상태 통합 관리

```typescript
// useAuth.ts 훅 만들기
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
}
```

---

### Tip 4: 에러 메시지 한글화

```typescript
const getErrorMessage = (error: any): string => {
  const message = error.message || '';
  
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
  }
  if (message.includes('already registered')) {
    return '이미 가입된 이메일입니다.';
  }
  
  return '오류가 발생했습니다. 다시 시도해주세요.';
};
```

---

### Tip 5: 개발 중 쿠키 문제 해결

```bash
# 브라우저 개발자 도구에서
# Application → Cookies → localhost
# sb-관련 쿠키 모두 삭제 후 새로고침
```

---

## 🚀 다음 단계

더 자세한 정보:
- **전체 문서**: `docs/AUTH_SYSTEM.md`
- **시작 가이드**: `README_AUTH.md`
- **Supabase 문서**: https://supabase.com/docs/guides/auth

