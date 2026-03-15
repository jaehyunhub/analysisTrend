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
docker-compose up -d          # 전체 서비스 시작 (MySQL :3306, Redis :6379, backend :8080, frontend :3000, analysis :8000)
docker-compose up -d mysql redis  # DB만 실행 (로컬 백엔드 개발 시)
```

## 아키텍처

### 프론트엔드 — FSD (Feature-Sliced Design)
프론트엔드는 Feature-Sliced Design 패턴을 따릅니다:
- `shared/` — 재사용 가능한 UI 컴포넌트(`Button`), 유틸리티(`utils.ts`), 전역 상태(`modalStore.ts`, Zustand)
- `entities/` — 도메인 모델과 UI (예: `post/ui/PostCard`)
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
- `global/config/` — SecurityConfig (무상태 JWT + OAuth2), RedisConfig
- `global/auth/` — JwtTokenProvider, JwtAuthenticationFilter, OAuth2SuccessHandler
- `global/controller/` — HealthController
- `global/baseEntity/` — BaseTimeEntity (JPA 감사)
- `user/` — domain (User, Role, AuthProvider), repository, service, controller, DTO

인증 흐름: OAuth2 로그인 (Google, Kakao, Naver) → `CustomOAuth2UserService` → `OAuth2SuccessHandler`가 JWT 발급 → 프론트엔드가 토큰 저장 후 `JwtAuthenticationFilter`를 통해 전송.

API 접두사: `/api/v1/`

### 분석 서비스
`analysis/main.py`의 FastAPI 앱으로, 헬스체크 엔드포인트를 제공합니다. 포트 8000에서 실행됩니다.

## 주요 기술 사항
- 백엔드는 무상태 세션 사용 (`SessionCreationPolicy.STATELESS`) — 서버 측 세션 없음
- QueryDSL 생성 소스 경로: `$buildDir/generated/querydsl`
- 테스트 DB: H2 인메모리 (운영: MySQL 8.0)
- 프론트엔드 상태 관리: Zustand (Redux 아님)
- UI 컴포넌트 라이브러리: Radix UI + CVA (class-variance-authority) + tailwind-merge
