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
```

### 백엔드 (`backend/`)
```bash
./gradlew bootRun                    # 서버 실행 :8080
./gradlew test                       # 전체 테스트 (JUnit 5, H2 인메모리)
./gradlew test --tests "backend.SomeTest.methodName"  # 단일 테스트
./gradlew build                      # JAR 빌드
```

### 인프라
```bash
docker-compose up -d          # 전체 서비스 시작 (Nginx :80, MySQL, Redis, backend :8080, frontend :3000, analysis :8000)
docker-compose up -d mysql redis  # DB만 실행 (로컬 백엔드 개발 시)
```

## 아키텍처

### 프론트엔드 — FSD (Feature-Sliced Design)
프론트엔드는 Feature-Sliced Design 패턴을 따릅니다:
- `shared/api/` — fetch wrapper(`client.ts`), 엔드포인트 상수(`endpoints.ts`), mock API(`mock/`)
- `shared/types/` — 도메인 타입 (Post, User, Community, Product, Schedule, Video, Magazine)
- `shared/mocks/` — mock 데이터 (posts, communities, products, videos, schedules, users, magazines)
- `shared/model/` — Zustand 스토어 (`modalStore`, `authStore`, `communityStore`, `cartStore`, `toastStore`)
- `shared/ui/` — 재사용 가능한 UI 컴포넌트 (`Button`, `Skeleton`, `Spinner`, `Toast`, `ErrorMessage`)
- `entities/` — 도메인 모델과 UI (예: `post/ui/PostCard`, `post/api/postApi.ts`)
- `features/` — 사용자 기능 (`auth/ui/LoginModal`, `post/ui/CreatePostModal`, `search/`, `community/`)
- `widgets/` — 조합형 레이아웃 블록 (`Header`, `Footer`, `Sidebar`)
- `app/` — Next.js App Router 페이지 및 레이아웃

전역 모달은 루트 레이아웃의 `ModalProvider`를 통해 렌더링되며, Zustand 스토어(`useModalStore`)로 제어됩니다.

관리자 페이지는 `app/admin/` 하위에 별도 레이아웃과 서브 라우트로 구성됩니다. 섹션별 메뉴 구조:
- **콘텐츠**: `banner/`, `schedule/`, `youtube/`
- **분석 도구**: `analysis/` (채널분석·Persona C), `trends/` (뉴스키워드·YouTube트렌딩·Persona C/E), `chat/` (채팅분석·편집마커·Persona D)
- **운영**: `ads/`, `community/members`, `community/posts`

Header(`widgets/Header/ui/Header.tsx`)는 데스크탑 네비게이션과 모바일 오른쪽 슬라이드 드로어 메뉴를 모두 지원합니다.

### 백엔드 — 레이어드 아키텍처
`backend/` 패키지 구조:
- `global/config/` — SecurityConfig (무상태 JWT + OAuth2), RedisConfig, WebMvcConfig, JpaAuditingConfig
- `global/auth/` — JwtTokenProvider, JwtAuthenticationFilter, OAuth2SuccessHandler
- `global/controller/` — HealthController
- `global/baseEntity/` — BaseTimeEntity (JPA 감사: createdAt, updatedAt)
- `global/exception/` — GlobalExceptionHandler, ErrorCode, ErrorResponse, BusinessException
- `global/common/` — ApiResponse (success, data, message, timestamp)
- `user/` — domain (User, Role, AuthProvider), repository, service, controller, DTO
- `community/` — Community 도메인 (CRUD, `/api/v1/communities`)
- `post/` — Post·Comment·Vote 도메인 (투표, 댓글 중첩, `/api/v1/posts`)
- `product/` — Product 도메인 (카테고리 필터, `/api/v1/products`)

인증 흐름: OAuth2 로그인 (Google, Kakao, Naver) → `CustomOAuth2UserService` → `OAuth2SuccessHandler`가 JWT 발급 → 프론트엔드가 토큰 저장 후 `JwtAuthenticationFilter`를 통해 전송.

API 접두사: `/api/v1/`

### 분석 서비스
`analysis/main.py`의 FastAPI 앱. 포트 8000에서 실행됩니다.
- `config.py` — pydantic-settings 환경 변수
- `routers/` — `health.py`, `chat.py`(`/analyze`), `trends.py`(`/trends`)
- `services/` — `chat_analyzer.py`, `news_collector.py`, `youtube_collector.py`, `cache.py`
- `parsers/` — Strategy 패턴 (`csv_parser`, `json_parser`, `txt_parser`)
- `models/` — `chat.py`, `trend.py` (Pydantic 모델)

## 주요 기술 사항
- 백엔드는 무상태 세션 사용 (`SessionCreationPolicy.STATELESS`) — 서버 측 세션 없음
- QueryDSL 생성 소스 경로: `$buildDir/generated/querydsl`
- 테스트 DB: H2 인메모리 (운영: MySQL 8.0)
- 프론트엔드 상태 관리: Zustand (Redux 아님)
- UI 컴포넌트 라이브러리: Radix UI + CVA (class-variance-authority) + tailwind-merge
- mock/실제 API 전환: `frontend/.env.local`의 `NEXT_PUBLIC_USE_MOCK` 플래그
- API 표준 응답: `ApiResponse<T>` (`{ success, data, message, timestamp }`)
- 인프라: Nginx 리버스 프록시 (포트 80 단일 진입점) + MySQL healthcheck

## MCP 서버 (`.mcp.json`)

프로젝트 루트 `.mcp.json`에 Claude Code용 MCP 서버가 구성되어 있습니다:

| 서버 | 패키지 | 연결 |
|---|---|---|
| `mysql` | `@benborla29/mcp-server-mysql` | `127.0.0.1:3306 / analysis_trend` |
| `redis` | `@modelcontextprotocol/server-redis` | `redis://localhost:6379` |
| `postgres` | `@modelcontextprotocol/server-postgres` | `POSTGRES_URL` env 참조 |
| `docker` | `mcp-server-docker` | `/var/run/docker.sock` |
