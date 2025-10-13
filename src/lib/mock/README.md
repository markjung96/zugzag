# Mock 데이터 가이드

이 디렉토리는 개발 중에 사용할 Mock 데이터를 포함합니다.

## 파일 구조

```
mock/
├── events.ts        # 일정 데이터
├── crews.ts         # 크루 데이터
├── users.ts         # 사용자/프로필 데이터
├── attendances.ts   # 참석 정보 데이터
├── index.ts         # 통합 export
└── README.md        # 이 파일
```

## 사용 방법

### 1. Mock 데이터 활성화

`.env.local` 파일에 다음을 추가:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. 컴포넌트에서 사용

```typescript
import { mockEvents, mockCrews, USE_MOCK_DATA } from "@/lib/mock";

export default function MyComponent() {
  // Mock 데이터 사용 여부에 따라 분기
  if (USE_MOCK_DATA) {
    return <div>{/* Mock 데이터로 렌더링 */}</div>;
  }

  // 실제 API 호출
  // ...
}
```

### 3. API 라우트에서 사용

```typescript
import { mockEvents, USE_MOCK_DATA } from "@/lib/mock";
import { NextResponse } from "next/server";

export async function GET() {
  if (USE_MOCK_DATA) {
    return NextResponse.json(mockEvents);
  }

  // 실제 DB 조회
  // ...
}
```

## Mock 데이터 종류

### Events (일정)
- 총 5개의 샘플 일정
- 1개 과거 일정 (완료)
- 2개 다가오는 일정
- 2개 미래 일정
- 단계별 정보 (1차/2차) 포함

### Crews (크루)
- 총 3개의 샘플 크루
- 공개/비공개 크루
- 크루별 멤버 정보

### Users (사용자)
- 총 5명의 샘플 사용자
- 다양한 클라이밍 레벨 (V2-V8)
- 크루장, 관리자, 일반 멤버 역할

### Attendances (참석)
- 각 일정별 참석자 정보
- 다양한 참석 상태 (attending, maybe, waitlist, no_show 등)
- 체크인/체크아웃 기록

## 주의사항

- Mock 데이터는 개발 환경에서만 사용하세요
- Production 환경에서는 `NEXT_PUBLIC_USE_MOCK_DATA`를 설정하지 마세요
- Mock 데이터를 수정하여 다양한 시나리오를 테스트할 수 있습니다

## 실제 데이터로 전환

실제 Supabase 데이터베이스를 사용할 준비가 되면:

1. `.env.local`에서 `NEXT_PUBLIC_USE_MOCK_DATA` 제거 또는 `false`로 설정
2. 실제 API 호출 로직으로 전환
3. Mock 데이터 import 제거

```typescript
// Before (Mock)
import { mockEvents } from "@/lib/mock";
const events = mockEvents;

// After (Real)
import { getEvents } from "@/lib/api/event-helpers";
const { events } = await getEvents({ status: "upcoming" });
```


