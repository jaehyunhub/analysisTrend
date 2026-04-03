# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 가이드입니다.
**서비스별 상세 가이드**: [`frontend/CLAUDE.md`](./frontend/CLAUDE.md) · [`backend/CLAUDE.md`](./backend/CLAUDE.md) · [`analysis/CLAUDE.md`](./analysis/CLAUDE.md) · [`e2e/CLAUDE.md`](./e2e/CLAUDE.md)

## 언어

항상 한국어로 응답할 것.

## 프로젝트 개요

analysisTrend — Docker Compose로 구성된 트렌드 분석 플랫폼:
- **frontend** — Next.js 16 (React 19, TypeScript, Tailwind CSS v4, Zustand) → `frontend/CLAUDE.md`
- **backend** — Spring Boot 3.5 (Java 17, JPA, QueryDSL, Redis, JWT + OAuth2) → `backend/CLAUDE.md`
- **analysis** — FastAPI (Python) 분석 마이크로서비스 → `analysis/CLAUDE.md`

## 명령어 (빠른 참조)

```bash
# 프론트엔드 (frontend/)
npm run dev && npx tsc --noEmit    # 개발 + 타입 검사 (npm run build 금지 — 아래 주의 참고)

# 백엔드 (backend/)
./gradlew bootRun && ./gradlew test

# 분석 서비스 (analysis/)
uvicorn main:app --reload --port 8000 && pytest tests/

# 인프라
docker-compose up -d                  # 전체 서비스 시작 (Nginx :80, MySQL, Redis, :8080, :3000, :8000)
docker-compose up -d mysql redis      # DB만 실행 (로컬 백엔드 개발 시)
docker-compose build --no-cache       # 전체 이미지 재빌드
docker-compose build analysis         # analysis만 재빌드 (환경변수 변경 시 필수)

# E2E (docker-compose up -d 선행 필요)
cd e2e && npm test                    # 전체 실행 (tests/workflows/ 6개 그룹)
cd e2e && npm run test:ui             # Playwright UI 모드 (권장)
cd e2e && npm test -- --grep "WF-F"  # 특정 그룹만 실행
```

## 빌드 주의

`npm run build`는 **로컬에서 사용 금지** — Turbopack이 한글 경로(`포트폴리오`)에서 패닉.
타입 검사는 `npx tsc --noEmit` 사용. Docker 내부(경로 ASCII)에서는 정상 빌드 가능.

## 인프라 구성

- Nginx 리버스 프록시 (포트 80 단일 진입점) + MySQL healthcheck
- API 표준 응답: `ApiResponse<T>` — `{ success, data, message, timestamp }`
- API 접두사: `/api/v1/`
- 테스트 3계층: Unit(Jest) · Integration(JUnit) · FastAPI(pytest) · E2E(Playwright)

## 커뮤니티 UI 리디자인 (2026-04-04)

Old Reddit 스타일 → 모던 카드 스타일로 전환. 변경 파일:
- `entities/post/ui/PostCard.tsx` — 투표 컬럼 제거, 하단 액션바, 카테고리 pill 태그
- `app/community/board/[slug]/page.tsx` — 카테고리별 그라디언트 배너, 이모지 정렬 탭, 빈 상태 UI
- `app/community/board/[slug]/comments/[postId]/page.tsx` — rounded-2xl, 다크모드 색상 통일
- `widgets/Sidebar/ui/Sidebar.tsx` — 다크모드 배경 `#0F1117`

배경: `#DAE0E6` → `gray-50` | 카드: `rounded-[4px]` → `rounded-2xl` | 다크 카드: `#1A1A1B` → `#1E2028`

## E2E 테스트 구조

**77개 테스트 / 74 passed / 3 skipped / 0 failed** (2026-04-04 기준)

```
e2e/tests/workflows/               ← 최종 테스트 파일 (6개)
  group-a.home-admin-content.spec.ts   홈화면 + 관리자 콘텐츠 CRUD (배너/일정/유튜브/광고/매거진)
  group-b.community.spec.ts            커뮤니티 워크플로우 (글/투표/댓글/검색/가입)
  group-c.shopping.spec.ts             쇼핑몰 워크플로우 (상품/장바구니/QnA/리뷰/이미지)
  group-d.analysis-tools.spec.ts       분석 도구 (채팅분석/트렌드/채널분석/회원관리)
  group-e.ux-and-missing-pages.spec.ts UX (다크모드/모바일/매거진/404/마이페이지/Toast)
  group-f.community-comprehensive.spec.ts 커뮤니티 종합 (유저·관리자, wepoll 실데이터)
```

테스트 계획 상세: `e2e/TEST_PLAN.md` · 가이드: `e2e/CLAUDE.md`

## MCP 서버 (`.mcp.json`)

| 서버 | 패키지 | 연결 |
|---|---|---|
| `mysql` | `@benborla29/mcp-server-mysql` | `127.0.0.1:3306 / analysis_trend` |
| `redis` | `@modelcontextprotocol/server-redis` | `redis://localhost:6379` |
| `postgres` | `@modelcontextprotocol/server-postgres` | `POSTGRES_URL` env 참조 |
| `docker` | `mcp-server-docker` | `/var/run/docker.sock` |
