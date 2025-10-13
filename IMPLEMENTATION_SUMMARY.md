# 일정 관리 시스템 구현 완료 ✅

## 📋 구현 개요

크루 일정 생성/관리 시스템의 핵심 기능을 모두 구현했습니다. Mock 데이터를 활용하여 전체 플로우를 테스트할 수 있으며, 실제 API와의 연동은 각 파일의 `TODO` 주석을 참고하여 진행하면 됩니다.

## ✨ 완료된 기능

### 1. Mock 데이터 시스템 (/src/lib/mock/)
- ✅ `events.ts` - 일정 데이터 (5개 샘플)
- ✅ `crews.ts` - 크루 데이터 (3개 샘플)
- ✅ `users.ts` - 사용자 데이터 (5명 샘플)
- ✅ `attendances.ts` - 참석 정보 데이터
- ✅ `README.md` - Mock 데이터 사용 가이드

### 2. 일정 관리 (/schedule, /events)

#### 일정 목록 페이지 (/schedule)
- ✅ 리스트 뷰 & 캘린더 뷰 전환
- ✅ 검색 기능
- ✅ 필터 (상태, 크루별)
- ✅ 일정 카드 (정원, 참석자, 태그 표시)
- ✅ 반응형 디자인

#### 일정 상세 페이지 (/events/[id])
- ✅ 일정 기본 정보 (제목, 설명, 날짜, 시간, 장소, 정원)
- ✅ 1차/2차 멀티 단계 타임라인
- ✅ 참석자 목록 (참석/대기/미정/불참)
- ✅ 암장 지도 (카카오맵 연동 준비)
- ✅ RSVP 버튼 (하단 고정)
- ✅ 크루장 메뉴 (수정/체크인/취소)

#### 일정 생성 페이지 (/events/create)
- ✅ 기본 정보 입력
- ✅ 멀티 단계 (1차/2차/3차...) 추가/제거
- ✅ 암장 검색 및 선택
- ✅ 정원 설정
- ✅ 유효성 검사

#### 일정 수정 페이지 (/events/[id]/edit)
- ✅ 기존 데이터 불러오기
- ✅ 생성 페이지와 동일한 폼
- ✅ 권한 체크 (크루장만)

#### 체크인 페이지 (/events/[id]/check-in)
- ✅ 참석자 목록
- ✅ 체크인/노쇼 처리
- ✅ 검색 기능
- ✅ 실시간 통계 (참석 예정/완료/대기)

### 3. 크루 관리 (/crews)

#### 크루 목록 페이지 (/crews)
- ✅ 크루 카드 그리드
- ✅ 검색 기능
- ✅ 크루 정보 (멤버 수, 일정 수, 지역, 태그)

#### 크루 상세 페이지 (/crews/[id])
- ✅ 크루 정보
- ✅ 탭 (일정/멤버)
- ✅ 일정 목록
- ✅ 멤버 목록 (역할별)
- ✅ 권한별 액션 버튼 (통계/설정/가입/탈퇴)

#### 크루 통계 대시보드 (/crews/[id]/stats)
- ✅ 핵심 지표 (총 일정, 출석률, 총 참석, 노쇼)
- ✅ 멤버별 참석 통계 (순위, 출석률)
- ✅ 인기 암장 랭킹
- ✅ 요일별 일정 분포
- ✅ 시각화 (프로그레스 바, 그라디언트)

### 4. 대시보드 (/dashboard)
- ✅ 사용자 맞춤 통계 (참석한 일정, 가입 크루, 이번 달 일정)
- ✅ 다가오는 일정 (최대 3개)
- ✅ 내 크루 목록
- ✅ 자주 가는 암장
- ✅ 이번 달 활동 진행률

### 5. 프로필 (/profile)
- ✅ 사용자 정보 (아바tar, 이름, 이메일, 레벨)
- ✅ 활동 통계 (총 참석, 출석률, 이번 달 활동, 레벨)
- ✅ 최근 활동 내역
- ✅ 선호 암장
- ✅ 노쇼 경고
- ✅ 로그아웃

## 🎨 디자인 시스템

### 컬러 팔레트
- **배경**: zinc-950 (다크 테마)
- **카드**: zinc-900/50 (반투명 백드롭)
- **테두리**: zinc-800
- **주요 액션**: orange-500 ~ orange-600 (그라디언트)
- **보조 액션**: cyan-400 ~ cyan-500
- **성공**: green-500
- **경고**: yellow-500
- **에러**: red-500

### 컴포넌트
- **Motion**: Framer Motion으로 부드러운 애니메이션
- **아이콘**: Lucide React
- **반응형**: Tailwind CSS 브레이크포인트

## 📂 폴더 구조

```
src/
├── lib/
│   └── mock/                    # Mock 데이터
│       ├── events.ts
│       ├── crews.ts
│       ├── users.ts
│       ├── attendances.ts
│       ├── index.ts
│       └── README.md
│
├── app/(main)/
│   ├── layout.tsx               # 메인 레이아웃 (사이드바, 네비게이션)
│   │
│   ├── dashboard/
│   │   └── page.tsx             # 대시보드
│   │
│   ├── schedule/
│   │   ├── page.tsx             # 일정 목록
│   │   └── _components/
│   │       ├── event-list.tsx
│   │       ├── event-calendar.tsx
│   │       ├── event-card.tsx
│   │       └── filter-bar.tsx
│   │
│   ├── events/
│   │   ├── create/
│   │   │   └── page.tsx         # 일정 생성
│   │   └── [id]/
│   │       ├── page.tsx         # 일정 상세
│   │       ├── edit/
│   │       │   └── page.tsx     # 일정 수정
│   │       ├── check-in/
│   │       │   └── page.tsx     # 체크인
│   │       └── _components/
│   │           ├── phase-timeline.tsx
│   │           ├── attendance-section.tsx
│   │           ├── rsvp-button.tsx
│   │           └── event-map.tsx
│   │
│   ├── crews/
│   │   ├── page.tsx             # 크루 목록
│   │   └── [id]/
│   │       ├── page.tsx         # 크루 상세
│   │       └── stats/
│   │           └── page.tsx     # 크루 통계
│   │
│   └── profile/
│       └── page.tsx             # 프로필
```

## 🔌 API 연동 가이드

각 페이지에서 `TODO: API 호출` 주석을 찾아 실제 API로 교체하세요.

### 주요 연동 포인트

1. **일정 목록** (`/schedule/page.tsx`, `event-list.tsx`)
   ```typescript
   // Before (Mock)
   const events = mockEvents.filter(...);
   
   // After (Real API)
   const { events } = await getEvents({ status: "upcoming" });
   ```

2. **일정 상세** (`/events/[id]/page.tsx`)
   ```typescript
   // Before (Mock)
   const event = mockEvents.find(e => e.id === eventId);
   
   // After (Real API)
   const { event } = await getEventById(eventId);
   ```

3. **RSVP** (`rsvp-button.tsx`)
   ```typescript
   // TODO: API 호출
   await registerAttendance({
     event_id: eventId,
     user_id: currentUser.id,
     status: selectedStatus,
     user_note: userNote,
   });
   ```

## 🚀 실행 방법

### Mock 데이터 모드로 실행

`.env.local` 파일에 추가:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 개발 서버 실행
```bash
pnpm dev
```

### 페이지 확인
- 대시보드: http://localhost:3000/dashboard
- 일정 목록: http://localhost:3000/schedule
- 크루 목록: http://localhost:3000/crews
- 프로필: http://localhost:3000/profile

## ⚠️ 주의사항

1. **Mock 데이터 사용**
   - 현재는 Mock 데이터로 동작합니다
   - 실제 API 연동 시 `USE_MOCK_DATA` 환경 변수를 제거하세요

2. **권한 관리**
   - 현재 `currentUser`는 고정값입니다
   - 실제 인증 시스템과 연동 필요

3. **이미지**
   - 아바타는 이니셜로 표시됩니다
   - 실제 이미지 업로드 기능 추가 필요

4. **지도**
   - 카카오맵/네이버맵 API 키 필요
   - `event-map.tsx`에서 실제 지도 embed 구현 필요

## 🎯 다음 단계

### Phase 1: 실제 API 연동
- [ ] Supabase 클라이언트 설정
- [ ] API 헬퍼 함수 테스트
- [ ] Mock 데이터 → 실제 데이터 전환

### Phase 2: 추가 기능
- [ ] 알림 시스템 (일정 리마인더)
- [ ] 반복 일정
- [ ] 댓글/공지 기능
- [ ] 이미지 업로드
- [ ] 실시간 업데이트 (Supabase Realtime)

### Phase 3: 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] SEO 최적화
- [ ] 성능 모니터링

## 📝 참고 문서

- [Mock 데이터 가이드](/src/lib/mock/README.md)
- [API 헬퍼 함수](/src/lib/api/event-helpers.ts)
- [데이터베이스 스키마](/supabase/migrations/005_events_and_attendances.sql)

---

**구현 완료일**: 2025-10-13
**개발 환경**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion


