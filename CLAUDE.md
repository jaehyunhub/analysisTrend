# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 언어

항상 한국어로 응답할 것 (RULES.md 참고).

## 프로젝트 개요

analysisTrend는 Docker Compose로 구성된 3개의 서비스로 이루어진 트렌드 분석 플랫폼입니다:
- **frontend** — Next.js 16 (React 19, TypeScript, Tailwind CSS v4, Zustand)
- **backend** — Spring Boot 3.5 (Java 17, JPA, QueryDSL, Redis, JWT + OAuth2)
- **analysis** — FastAPI (Python) 분석 마이크로서비스

## 명령어

### 프론트엔드 (`frontend/`)
```bash
npm run dev      # 개발 서버 :3000
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
npm test         # Jest 단위 테스트 (src/__tests__/)
npx tsc --noEmit # TypeScript 타입 검사 (build 대신 사용 — Turbopack 한글 경로 버그)
```

### 백엔드 (`backend/`)
```bash
./gradlew bootRun                    # 서버 실행 :8080
./gradlew test                       # 전체 테스트 (JUnit 5, H2 인메모리)
./gradlew test --tests "backend.SomeTest.methodName"  # 단일 테스트
./gradlew build                      # JAR 빌드
```

### 분석 서비스 (`analysis/`)
```bash
uvicorn main:app --reload --port 8000  # 개발 서버
pytest tests/                          # 단위 테스트
```

### 인프라
```bash
docker-compose up -d          # 전체 서비스 시작 (Nginx :80, MySQL, Redis, backend :8080, frontend :3000, analysis :8000)
docker-compose up -d mysql redis  # DB만 실행 (로컬 백엔드 개발 시)
docker-compose build --no-cache   # 전체 이미지 재빌드 (환경변수 변경 시)
```

### E2E 테스트 (`e2e/`)
```bash
cd e2e
npm test                          # 전체 실행 (docker-compose up -d 선행 필요)
npm test -- tests/auth/           # 특정 디렉토리만
npm test -- --grep "로그인"        # 테스트명 필터
npm run test:ui                   # Playwright UI 모드 (권장)
npm run test:headed               # 브라우저 보이며 실행
npm run test:report               # HTML 리포트 열기
npm run codegen                   # 셀렉터 자동 생성 도구
```

## 아키텍처

### 프론트엔드 — FSD (Feature-Sliced Design)
프론트엔드는 Feature-Sliced Design 패턴을 따릅니다:
- `shared/api/` — fetch wrapper(`client.ts`), 엔드포인트 상수(`endpoints.ts`), mock API(`mock/`)
  - `client.ts`의 주요 함수: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete` (백엔드), `analysisGet`, `analysisPostForm` (분석 서비스 multipart)
  - 환경변수: `NEXT_PUBLIC_API_URL`(백엔드), `NEXT_PUBLIC_ANALYSIS_URL`(분석 서비스)
  - 에러 처리: 네트워크 에러·5xx 응답 시 `toastStore`를 통해 전역 Toast 알림 자동 표시. 401은 기존 토큰 재발급 로직 유지(Toast 없음)
- `shared/types/` — 도메인 타입 (Post, Comment, User, Community, Product, Schedule, Video, Magazine)
- `shared/mocks/` — mock 데이터 (posts, communities, products, videos, schedules, users, magazines, mypage)
- `shared/model/` — Zustand 스토어
  - `modalStore` — 전역 모달 제어
  - `authStore` — 인증 (login/logout/checkAuth, localStorage persist)
  - `communityStore` — 게시글/투표/댓글 (addPost, votePost, addComment, getSortedPosts)
  - `cartStore` — 장바구니 (addItem, removeItem, updateQuantity)
  - `toastStore` — 알림 (addToast, 자동 dismiss)
  - `themeStore` — 다크모드 (toggle, `document.documentElement.className` 연동)
- `shared/ui/` — 재사용 가능한 UI 컴포넌트 (`Button`, `Skeleton`, `Spinner`, `Toast`, `ErrorMessage`)
- `entities/` — 도메인 모델과 UI (예: `post/ui/PostCard`, `post/api/postApi.ts`)
- `features/` — 사용자 기능 (`auth/ui/LoginModal`, `post/ui/CreatePostModal`, `post/ui/PostDetailModal`, `search/`, `community/`)
- `widgets/` — 조합형 레이아웃 블록 (`Header`, `Footer`, `Sidebar`)
- `app/` — Next.js App Router 페이지 및 레이아웃
- `src/__tests__/` — Jest 단위 테스트 (authStore, communityStore, cartStore, toastStore, themeStore)

전역 모달은 루트 레이아웃의 `ModalProvider`를 통해 렌더링되며, Zustand 스토어(`useModalStore`)로 제어됩니다.

관리자 페이지는 `app/admin/` 하위에 별도 레이아웃과 서브 라우트로 구성됩니다. `admin/layout.tsx`에서 `useAuthStore`로 비인증/비관리자 접근 시 `/` 리다이렉트합니다. 섹션별 메뉴 구조:
- **콘텐츠**: `banner/` (CRUD + 활성 토글), `schedule/` (CRUD), `youtube/` (CRUD)
- **분석 도구**: `analysis/` (채널분석·Persona C), `trends/` (실시간 뉴스·YouTube 트렌딩 API 연동), `chat/` (채팅 파일 업로드 → 실제 분석 API 연동)
- **운영**: `ads/`, `community/members`, `community/posts`

Header(`widgets/Header/ui/Header.tsx`)는 데스크탑 네비게이션, 모바일 오른쪽 슬라이드 드로어 메뉴, 다크모드 토글 버튼, 인증 상태 UI(로그인 시 avatar 이니셜·닉네임·로그아웃 버튼)를 지원합니다.

Sidebar(`widgets/Sidebar/ui/Sidebar.tsx`)는 마운트 시 `USE_MOCK_API` 플래그에 따라 커뮤니티 목록을 실제 API(`GET /api/v1/communities`) 또는 mock 데이터에서 로드합니다. API 실패 시 mock으로 fallback합니다.

SEO: `community/`, `shop/`, `mypage/` 라우트에 각각 `layout.tsx`를 통해 페이지별 `Metadata`를 설정합니다(`"use client"` 페이지는 metadata export 불가이므로 layout으로 분리).

### 백엔드 — 레이어드 아키텍처
`backend/` 패키지 구조:
- `global/config/` — SecurityConfig (무상태 JWT + OAuth2, `@EnableMethodSecurity`), RedisConfig, WebMvcConfig, JpaAuditingConfig
- `global/auth/` — JwtTokenProvider, JwtAuthenticationFilter, OAuth2SuccessHandler
- `global/controller/` — HealthController
- `global/baseEntity/` — BaseTimeEntity (JPA 감사: createdAt, updatedAt)
- `global/exception/` — GlobalExceptionHandler, ErrorCode, ErrorResponse, BusinessException
- `global/common/` — ApiResponse (success, data, message, timestamp)
- `user/` — domain (User, Role, AuthProvider), repository, service, controller, DTO
- `community/` — Community 도메인 (CRUD, `/api/v1/communities`)
- `post/` — Post·Comment·Vote 도메인 (투표, 댓글 중첩, `/api/v1/posts`)
- `product/` — Product 도메인 (카테고리 필터, `/api/v1/products`)
- `banner/` — Banner 도메인 (공개 `GET /api/v1/banners`, 관리자 CRUD `POST/PUT/DELETE/PATCH /api/v1/admin/banners/**`)
- `schedule/` — Schedule 도메인 (공개 `GET /api/v1/schedules`, 관리자 CRUD `/api/v1/admin/schedules/**`)
- `youtube/` — YoutubeVideo 도메인 (공개 `GET /api/v1/youtube`, 관리자 CRUD `/api/v1/admin/youtube/**`)

관리자 API 보호: SecurityConfig에서 `/api/v1/admin/**`는 `hasRole("ADMIN")` 필요. 컨트롤러에는 추가로 `@PreAuthorize("hasRole('ADMIN')")` 적용.

인증 흐름: OAuth2 로그인 (Google, Kakao, Naver) → `CustomOAuth2UserService` → `OAuth2SuccessHandler`가 JWT 발급 → 프론트엔드가 토큰 저장 후 `JwtAuthenticationFilter`를 통해 전송. 401 시 `client.ts`가 자동으로 refresh token 재발급 시도.

API 접두사: `/api/v1/`

### 분석 서비스
`analysis/main.py`의 FastAPI 앱. 포트 8000에서 실행됩니다. FastAPI lifespan으로 APScheduler를 앱 시작/종료에 연동합니다.
- `config.py` — pydantic-settings 환경 변수 (NAVER_CLIENT_ID, YOUTUBE_API_KEY 등)
- `routers/` — `health.py`, `chat.py`(prefix `/analyze`), `trends.py`(prefix `/trends`)
- `services/` — `chat_analyzer.py` (버킷 집계·피크 감지·TF-IDF), `news_collector.py` (Naver News API), `youtube_collector.py` (YouTube Data API v3), `cache.py` (Redis 비동기 캐시)
- `parsers/` — Strategy 패턴 (`base.py` BOM/인코딩 감지, `csv_parser`, `json_parser`, `txt_parser`)
- `models/` — `chat.py` (HeatmapBucket, PeakSegment, ChatAnalysisResult), `trend.py` (TrendKeyword, TrendingVideo)
- `tasks/scheduler.py` — APScheduler `AsyncIOScheduler`, 30분 주기 뉴스 키워드 수집
- `tests/` — `test_parsers.py`, `test_chat_analyzer.py`, `test_cache.py` (pytest-asyncio + AsyncMock)

주요 엔드포인트:
- `POST /analyze/chat` — 채팅 파일 업로드 분석 (CSV/JSON/TXT)
- `GET /analyze/chat/session/{session_id}` — 캐시된 분석 결과 조회
- `GET /trends/news` — 뉴스 키워드 (Redis 캐시 30분)
- `GET /trends/youtube?region=KR&category=0` — YouTube 트렌딩 (Redis 캐시 30분)
- `GET /trends/keywords` — 뉴스+YouTube 통합 키워드

## 주요 기술 사항
- 백엔드는 무상태 세션 사용 (`SessionCreationPolicy.STATELESS`) — 서버 측 세션 없음
- QueryDSL 생성 소스 경로: `$buildDir/generated/querydsl`
- 테스트 DB: H2 인메모리 (운영: MySQL 8.0)
- 프론트엔드 상태 관리: Zustand (Redux 아님)
- UI 컴포넌트 라이브러리: Radix UI + CVA (class-variance-authority) + tailwind-merge
- mock/실제 API 전환: `frontend/.env.local`의 `NEXT_PUBLIC_USE_MOCK` 플래그
- API 표준 응답: `ApiResponse<T>` (`{ success, data, message, timestamp }`)
- 인프라: Nginx 리버스 프록시 (포트 80 단일 진입점) + MySQL healthcheck
- **빌드 주의**: `npm run build`는 Turbopack이 한글 경로(`포트폴리오`)에서 패닉 — `npx tsc --noEmit`으로 타입 검사 대체. Docker 내부(경로 ASCII)에서는 정상 빌드 가능.
- `tsconfig.json`에서 `src/__tests__/`와 `jest.config.ts` 제외 처리됨 (Jest 타입과 충돌 방지)
- **테스트 3계층**:
  - **Unit** (`frontend/src/__tests__/`): Jest — Zustand 스토어 5개 (authStore, communityStore, cartStore, toastStore, themeStore)
  - **Integration** (`backend/src/test/`): JUnit 19개 — H2 인메모리, 테스트용 JWT_SECRET 별도 설정
  - **E2E** (`e2e/`): Playwright — 73개 테스트 케이스, 17개 스펙 파일. **최종 결과: 64 passed / 9 skipped / 0 failed** (2026-03-19). 진행 현황은 `e2e/TEST_PLAN.md` 참고
- **E2E 구조**: Page Object Model (POM) + fixtures(auth/community) + helpers(ApiHelper/DbHelper). `storageState`로 로그인 반복 제거
- **E2E 전제**: `docker-compose up -d` 후 `http://localhost` 응답 확인 → `cd e2e && npm test`
- **Spring Security 6.x 주의**: `permitAll()` 경로에 `/api/v1/communities/**` 외에 `/api/v1/communities` (루트 경로)도 명시 필요 — `/**`가 루트 자체를 매칭하지 않음
- **CORS**: `allowedOrigins`에 `http://localhost:3000`(로컬 개발)과 `http://localhost`(Nginx 포트 80) 모두 포함
- **Next.js Image**: 외부 이미지 허용 도메인은 `next.config.ts`의 `images.remotePatterns`에 추가. 현재 `images.unsplash.com` 허용 설정됨
- **SEO**: `"use client"` 페이지는 `metadata` export 불가 — 해당 라우트에 `layout.tsx`를 별도 생성해 `Metadata` 적용

## MCP 서버 (`.mcp.json`)

프로젝트 루트 `.mcp.json`에 Claude Code용 MCP 서버가 구성되어 있습니다:

| 서버 | 패키지 | 연결 |
|---|---|---|
| `mysql` | `@benborla29/mcp-server-mysql` | `127.0.0.1:3306 / analysis_trend` |
| `redis` | `@modelcontextprotocol/server-redis` | `redis://localhost:6379` |
| `postgres` | `@modelcontextprotocol/server-postgres` | `POSTGRES_URL` env 참조 |
| `docker` | `mcp-server-docker` | `/var/run/docker.sock` |
