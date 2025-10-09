# ⚡ 빠른 시작 가이드

## 🎯 당신이 제공해야 하는 값 (2개만!)

```env
NEXT_PUBLIC_SUPABASE_URL=________
NEXT_PUBLIC_SUPABASE_ANON_KEY=________
```

## 📍 찾는 곳

1. https://app.supabase.com 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴
4. 2개 복사:
   - Project URL
   - anon public 키

## ⚙️ 설정 순서

### 1️⃣ 환경 변수 설정 (1분)

```bash
# .env.local 파일 생성
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=여기에_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_KEY_붙여넣기
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 2️⃣ 데이터베이스 설정 (2분)

1. Supabase Dashboard → **SQL Editor**
2. `supabase/migrations/001_initial_schema.sql` 파일 열기
3. 전체 내용 복사
4. SQL Editor에 붙여넣기
5. **RUN** 클릭

### 3️⃣ Google 로그인 설정 (5분, 선택사항)

자세한 내용: `GOOGLE_LOGIN_SETUP.md` 참조

간단 요약:

1. Google Cloud Console에서 OAuth Client 생성
2. Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Google
4. Client ID와 Secret 입력

### 4️⃣ 실행 (10초)

```bash
pnpm install
pnpm dev
```

브라우저: http://localhost:3000

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] `.env.local` 파일에 URL과 KEY 입력
- [ ] SQL 마이그레이션 실행
- [ ] (선택) Google OAuth 설정
- [ ] `pnpm install` 실행
- [ ] `pnpm dev` 실행
- [ ] localhost:3000에서 확인

---

## 🎉 완료!

이제 "시작하기" 버튼을 눌러 Google로 로그인할 수 있습니다!

자세한 가이드가 필요하면: `SETUP_GUIDE.md` 참조
