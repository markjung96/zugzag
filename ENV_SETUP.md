# 환경 변수 설정 가이드

## 📝 `.env.local` 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App Configuration (선택사항)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔑 필요한 값 찾기

### 1. Supabase URL과 Anon Key

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Settings** 클릭
4. **API** 섹션 선택
5. 다음 값들을 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 예시

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1ODk2MDAsImV4cCI6MjAwNTE2NTYwMH0.example-signature
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ⚠️ 중요 사항

1. **`.env.local` 파일은 Git에 커밋하지 마세요!**
   - 이미 `.gitignore`에 포함되어 있습니다.

2. **Production 환경 변수 설정**
   - Vercel 배포 시: Vercel Dashboard > Settings > Environment Variables
   - 다른 호스팅: 해당 플랫폼의 환경 변수 설정 참조

3. **환경 변수 변경 후 서버 재시작**
   ```bash
   # 개발 서버 중지 (Ctrl+C)
   pnpm dev
   ```

## ✅ 설정 확인

환경 변수가 제대로 설정되었는지 확인:

```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 개발자 도구 열기
# Console에서 확인:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
# → "https://your-project-ref.supabase.co" 출력되어야 함
```
