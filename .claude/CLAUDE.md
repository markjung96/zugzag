# ZUGZAG Project - Claude Instructions

## Documentation

**이 프로젝트의 모든 기획 및 설계 문서는 `docs/` 디렉토리에 있습니다.**

프로젝트 관련 질문이나 작업 시 `docs/` 디렉토리의 문서들을 참고하세요:

- `docs/README.md` - 문서 가이드 (먼저 읽기)
- `docs/PRINCIPLES.md` - 서비스 원칙, 비즈니스 로직, 사용자 여정
- `docs/PLAN.md` - 구현 계획, DB 스키마, 화면 구성
- `docs/API.md` - API 명세
- `docs/DESIGN.md` - 색상 시스템, 디자인 가이드

## Project Overview

ZUGZAG는 클라이밍 크루의 출석 관리를 자동화하는 PWA입니다.

### Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- PWA (@ducanh2912/next-pwa)
- Serverless Postgres (Neon 또는 Supabase)

### Key Features
- 로그인/회원가입
- 크루 생성/가입 (초대 코드)
- 일정 CRUD (크루장 전용)
- 참석/불참 표시 (RSVP)
- 출석 현황 대시보드
- 정원 관리 (대기열)
