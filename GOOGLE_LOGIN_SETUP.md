# Google 로그인 설정 가이드

## 📋 필요한 정보

### 1. Supabase 프로젝트 정보

다음 값들이 필요합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**찾는 방법:**

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. Settings > API 메뉴
4. `Project URL`과 `anon public` 키 복사

---

## 🔧 설정 단계

### Step 1: Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com 접속
   - 프로젝트 생성 또는 기존 프로젝트 선택

2. **OAuth 동의 화면 설정**
   - `APIs & Services` > `OAuth consent screen` 선택
   - User Type: `External` 선택
   - 앱 정보 입력:
     - App name: `ZUGZAG`
     - User support email: 본인 이메일
     - Developer contact: 본인 이메일
   - 저장

3. **OAuth 2.0 Client ID 생성**
   - `APIs & Services` > `Credentials` 선택
   - `+ CREATE CREDENTIALS` > `OAuth client ID` 클릭
   - Application type: `Web application` 선택
   - Name: `ZUGZAG Web Client`
   - **중요: Authorized redirect URIs 추가**
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     예시: `https://abcdefghijk.supabase.co/auth/v1/callback`
4. **Client ID와 Client Secret 복사**
   - 생성된 Client ID와 Client Secret을 안전하게 보관

### Step 2: Supabase에 Google OAuth 설정

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **Google Provider 활성화**
   - `Authentication` > `Providers` 메뉴
   - `Google` 찾기
   - `Enable` 토글 활성화

3. **Google OAuth 정보 입력**
   - `Client ID`: Google Cloud Console에서 복사한 Client ID
   - `Client Secret`: Google Cloud Console에서 복사한 Client Secret
   - `Authorized Client IDs` (선택사항): 필요시 입력
   - `Skip nonce check` (선택사항): 일반적으로 체크 안 함
   - `Save` 클릭

4. **Redirect URL 확인**
   - Callback URL (for OAuth):
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - 이 URL이 Google Cloud Console의 Authorized redirect URIs에 있는지 확인

### Step 3: 데이터베이스 마이그레이션 실행

터미널에서 다음 명령어 실행:

```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# Supabase 프로젝트와 연결
supabase login
supabase link --project-ref <your-project-ref>

# 마이그레이션 실행
supabase db push
```

또는 Supabase Dashboard에서 직접:

1. `SQL Editor` 메뉴 선택
2. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. `RUN` 클릭

### Step 4: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 테스트

1. 개발 서버 실행:

   ```bash
   pnpm dev
   ```

2. http://localhost:3000 접속

3. "시작하기" 버튼 클릭

4. "Google" 로그인 버튼 클릭

5. Google 계정으로 로그인

6. 로그인 성공 시 대시보드로 리다이렉트

---

## 🔍 문제 해결

### "redirect_uri_mismatch" 오류

- Google Cloud Console의 Authorized redirect URIs가 정확한지 확인
- Supabase 프로젝트 URL이 정확한지 확인
- URI는 정확히 일치해야 함 (끝에 `/` 없이)

### "Invalid client" 오류

- Supabase에 입력한 Client ID와 Client Secret 재확인
- Google Cloud Console에서 OAuth 클라이언트가 활성화되어 있는지 확인

### 로그인 후 프로필이 생성되지 않음

- Database 마이그레이션이 정상적으로 실행되었는지 확인
- `handle_new_user()` 트리거가 활성화되어 있는지 확인
- Supabase Dashboard > Database > Tables에서 `profiles` 테이블 확인

---

## 📊 데이터베이스 스키마

생성되는 주요 테이블:

### `profiles` (사용자 프로필)

- 기본 정보: 이메일, 이름, 아바타
- 추가 정보: 닉네임, 바이오, 전화번호
- 역할: admin, leader, member
- 클라이밍 레벨

### `crews` (크루)

- 크루 정보: 이름, 설명, 로고
- 설정: 최대 인원, 공개/비공개

### `crew_members` (크루 멤버십)

- 크루와 유저 관계
- 역할: owner, admin, member

### `climbing_sessions` (클라이밍 세션)

- 클라이밍 기록
- 위치, 난이도, 메모, 사진

### `activity_logs` (활동 로그)

- 모든 활동 기록
- 감사 추적용

---

## 🚀 다음 단계

로그인이 완료되면:

1. 사용자 프로필 페이지 구현
2. 크루 생성/관리 기능 구현
3. 클라이밍 세션 기록 기능 구현
4. 대시보드 구현
