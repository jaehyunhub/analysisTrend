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
docker-compose up -d          # 전체 서비스 시작 (Nginx :80, MySQL :3306, Redis, backend :8080, frontend :3000, analysis :8000)
docker-compose up -d mysql redis  # DB만 실행 (로컬 백엔드 개발 시)
docker-compose build --no-cache   # 전체 이미지 재빌드 (환경변수 변경 시)
docker-compose build analysis     # analysis만 재빌드 (analysis/.env 키 변경 시 필수)
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
- `shared/api/` — fetch wrapper(`client.ts`), 엔드포인트 상수(`endpoints.ts`) (mock/ 디렉토리 삭제 완료 — config.ts·mockApi.ts·delay.ts 제거)
  - `client.ts`의 주요 함수: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete` (백엔드), `analysisGet`, `analysisPostForm` (분석 서비스 multipart)
  - 환경변수: `NEXT_PUBLIC_API_URL`(백엔드), `NEXT_PUBLIC_ANALYSIS_URL`(분석 서비스)
  - 에러 처리: 네트워크 에러·5xx 응답 시 `toastStore`를 통해 전역 Toast 알림 자동 표시. 401은 기존 토큰 재발급 로직 유지(Toast 없음)
- `shared/types/` — 도메인 타입 (Post, Comment, User, Community, Product, Schedule, Video, Magazine)
- `shared/mocks/` — mock 데이터 (magazines, mypage만 유지 — posts/communities/products/videos/schedules/users는 실제 API 전환 후 삭제 완료)
- `shared/model/` — Zustand 스토어
  - `modalStore` — 전역 모달 제어
  - `authStore` — 인증 (login/logout/checkAuth, fetchMe, updateNickname, localStorage persist)
  - `communityStore` — 게시글/투표/댓글/멤버십 (addPost, votePost, addComment, getSortedPosts, joinCommunity, leaveCommunity, isMember)
  - `cartStore` — 장바구니 (addItem, removeItem, updateQuantity)
  - `toastStore` — 알림 (addToast, 자동 dismiss)
  - `themeStore` — 다크모드 (toggle, `classList.toggle('dark')` 연동. className 직접 할당 금지)
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
- **운영**: `ads/`, `community/members` (실제 API 연동 완료), `community/posts`, `community/create` (커뮤니티 생성), `community/moderators` (moderator 설정)
- **쇼핑몰**: `shop/products/` (상품 CRUD + 품절 토글), `shop/qna/` (Q&A 목록 조회·답변 작성), `shop/reviews/` (리뷰 목록 조회·숨기기·삭제)

Header(`widgets/Header/ui/Header.tsx`)는 데스크탑 네비게이션, 모바일 오른쪽 슬라이드 드로어 메뉴, 다크모드 토글 버튼, 인증 상태 UI(로그인 시 avatar 이니셜·닉네임·로그아웃 버튼)를 지원합니다.

Sidebar(`widgets/Sidebar/ui/Sidebar.tsx`)는 마운트 시 실제 API(`GET /api/v1/communities`)에서 커뮤니티 목록을 로드합니다. API 실패 시 빈 배열로 처리합니다 (mock fallback 제거 완료).

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
  - `AuthController`: `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/reissue`
  - `AdminUserController`: `GET /api/v1/admin/users` (전체 목록 + 페이지네이션), `GET /api/v1/admin/users/search?email=` (이메일 검색)
- `community/` — Community 도메인 (CRUD, `/api/v1/communities`)
- `post/` — Post·Comment·Vote 도메인 (투표, 댓글 중첩, `/api/v1/posts`)
- `product/` — Product 도메인 (카테고리 필터, `/api/v1/products`, 관리자 CRUD `POST/PUT/DELETE/PATCH /api/v1/admin/products/**`)
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
- `tests/` — `test_parsers.py`, `test_chat_analyzer.py`, `test_cache.py`, `test_trends.py` (pytest-asyncio + AsyncMock)

주요 엔드포인트:
- `POST /analyze/chat` — 채팅 파일 업로드 분석 (CSV/JSON/TXT)
- `GET /analyze/chat/session/{session_id}` — 캐시된 분석 결과 조회
- `GET /trends/news` — 뉴스 키워드 (Redis 캐시 30분, Naver News API 연동 완료)
- `GET /trends/youtube?region=KR&category=0` — YouTube 트렌딩 (Redis 캐시 30분, YouTube Data API v3 연동 완료)
- `GET /trends/keywords` — 뉴스+YouTube 통합 키워드

## 주요 기술 사항
- 백엔드는 무상태 세션 사용 (`SessionCreationPolicy.STATELESS`) — 서버 측 세션 없음
- QueryDSL 생성 소스 경로: `$buildDir/generated/querydsl`
- 테스트 DB: H2 인메모리 (운영: MySQL 8.0)
- 프론트엔드 상태 관리: Zustand (Redux 아님)
- UI 컴포넌트 라이브러리: Radix UI + CVA (class-variance-authority) + tailwind-merge
- mock/실제 API 전환: `NEXT_PUBLIC_USE_MOCK` 플래그 및 `USE_MOCK_API` 분기 코드 전체 제거 완료 (2026-03-27) — 모든 API 호출이 실제 백엔드로 직접 연결됨
- API 표준 응답: `ApiResponse<T>` (`{ success, data, message, timestamp }`)
- 인프라: Nginx 리버스 프록시 (포트 80 단일 진입점) + MySQL healthcheck
- **빌드 주의**: `npm run build`는 Turbopack이 한글 경로(`포트폴리오`)에서 패닉 — `npx tsc --noEmit`으로 타입 검사 대체. Docker 내부(경로 ASCII)에서는 정상 빌드 가능.
- `tsconfig.json`에서 `src/__tests__/`와 `jest.config.ts` 제외 처리됨 (Jest 타입과 충돌 방지)
- **테스트 3계층**:
  - **Unit** (`frontend/src/__tests__/`): Jest — Zustand 스토어 5개 (authStore, communityStore, cartStore, toastStore, themeStore)
  - **Integration** (`backend/src/test/`): JUnit 19개 — H2 인메모리, 테스트용 JWT_SECRET 별도 설정
  - **FastAPI** (`analysis/tests/`): pytest-asyncio — 4개 파일 48개 (parsers 13 + analyzer 12 + cache 8 + trends 15). **최종 결과: 48 passed / 0 errors** (2026-03-27). `@pytest_asyncio.fixture` 수정 + `test_keywords_merged_scores` mock 패치로 전체 통과
  - **E2E** (`e2e/`): Playwright — 73개 테스트 케이스, 17개 스펙 파일. **최종 결과: 61 passed / 12 skipped / 0 failed** (2026-03-27). 진행 현황은 `e2e/TEST_PLAN.md` 참고
- **E2E 구조**: Page Object Model (POM) + fixtures(auth/community) + helpers(ApiHelper/DbHelper). `storageState`로 로그인 반복 제거
- **E2E admin 시드**: `global-setup.ts`에서 admin@e2e.com 회원가입 후 `helpers/db.ts`의 `setAdminRole()`로 DB에서 직접 ADMIN role 업데이트 (mysql2 기반)
- **E2E 전제**: `docker-compose up -d` 후 `http://localhost` 응답 확인 → `cd e2e && npm test`
- **Spring Security 6.x 주의**: `permitAll()` 경로에 `/api/v1/communities/**` 외에 `/api/v1/communities` (루트 경로)도 명시 필요 — `/**`가 루트 자체를 매칭하지 않음
- **CORS**: `allowedOrigins`는 `CORS_ALLOWED_ORIGINS` 환경변수로 관리 (기본값: `http://localhost:3000,http://localhost`). `SecurityConfig`와 `WebMvcConfig` 모두 적용
- **Next.js Image**: 외부 이미지 허용 도메인은 `next.config.ts`의 `images.remotePatterns`에 추가. 현재 `images.unsplash.com` 허용 설정됨
- **SEO**: `"use client"` 페이지는 `metadata` export 불가 — 해당 라우트에 `layout.tsx`를 별도 생성해 `Metadata` 적용
- **OAuth2 소셜 로그인 URL**: `window.location.origin + /oauth2/authorization/{provider}` 형식. `NEXT_PUBLIC_API_URL` 기반이면 포트 불일치로 callback redirect_uri 오류 발생
- **커뮤니티 멤버십**: `communityStore`의 `joinedCommunities`, `isMember(slug)` 으로 관리. 글 작성·삭제 권한 체크 시 참조
- **Post 작성자 권한**: `Post.authorId`와 `authStore.user.id` 비교로 수정/삭제 버튼 조건부 표시
- **다크모드**: Tailwind v4 기준 `globals.css`에 `@variant dark (&:is(.dark *))` 선언 필요. themeStore는 `classList.toggle('dark')` 방식 사용 (className 직접 할당 금지)
- **Header 장바구니**: `usePathname().startsWith('/shop') && isAuthenticated` 조건부 렌더링
- **authStore.fetchMe()**: 마이페이지 마운트 시 서버 최신 유저 정보 동기화
- **Google GSI Script 제거 이유**: `Header.tsx`에서 `<Script src="https://accounts.google.com/gsi/client">` 태그를 제거함. 이 스크립트가 브라우저에 Google 계정이 로그인된 경우 헤더 영역에 "E" 버튼을 자동 주입하는 원인이었음. OAuth2 로그인은 `LoginModal.tsx`의 `<a href>` 링크 방식으로 처리하므로 GSI 스크립트 불필요.
- **Mypage `_hasHydrated` fallback**: `mypage/page.tsx`에 2초 타임아웃 fallback 추가 — Zustand persist hydration이 지연되는 경우 무한 스피너 방지. `useAuthStore.getState()._hasHydrated`가 false이면 `setState({ _hasHydrated: true })`로 강제 완료.
- **Admin layout 접근 제어**: `admin/layout.tsx`에서 비인증/비관리자 접근 시 `return <div aria-hidden />` (콘텐츠 차단) + `useEffect`의 `router.replace('/')` 조합 사용. `return null`은 컴포넌트 마운트 자체를 막아 router.replace가 실행되지 않는 Next.js App Router 이슈가 있으므로 빈 div 반환 패턴 사용. `_hasHydrated` 2초 fallback도 동일하게 적용.
- **로그아웃 확인 모달**: `Header.tsx`의 로그아웃 버튼은 `logoutConfirmOpen` state로 확인 모달을 거쳐 실행됨. 데스크탑 + 모바일 드로어 모두 동일 패턴.
- **adsStore**: `shared/model/adsStore.ts` — Zustand + persist 광고 전역 스토어. `admin/ads/page.tsx`와 공유. localStorage `ads-storage` 키로 persist.
- **커뮤니티 게시물 필터**: `community/board/[slug]/page.tsx`에서 `communityStore.posts`를 `post.community === decodeURIComponent(slug)` 로 필터링. 매칭 없을 시 로컬 mock fallback.
- **마이페이지 내 커뮤니티**: `communityStore.joinedCommunities` 배열을 "내 커뮤니티" 서브탭에서 카드로 표시. 클릭 시 `/community/board/${name}` 이동.
- **커뮤니티 권한 시스템 (프론트엔드 UI 완료, 백엔드 API 미구현)**: `User` 엔티티의 `Role` enum에 `COMMUNITY_MODERATOR` 추가 예정. 커뮤니티별 권한은 별도 `community_permission` 테이블(`user_id`, `community_id`, `role`, `granted_by`)로 관리. 백엔드 글 작성 권한 체크에 `@communityPermissionService.hasModerator()` 조건 추가 필요. 관리자 페이지 UI 완료: `admin/community/create/page.tsx` (커뮤니티 생성 폼), `admin/community/moderators/page.tsx` (moderator 설정 탭) 신규 추가 완료. 백엔드 API 연동은 Phase 2 과제.
- **배너/광고 이미지 업로드 (완료)**: base64 방식으로 구현됨. `Banner.imageUrl`이 `@Column(columnDefinition = "TEXT")`로 변경되어 base64 이미지 저장 가능.
- **유튜브 썸네일**: YouTube video_id로 썸네일을 표시할 때 `https://img.youtube.com/vi/{video_id}/mqdefault.jpg` 형식 사용. `next.config.ts`의 `images.remotePatterns`에 `img.youtube.com` 도메인 추가 필요.
- **shopQnaStore**: `shared/model/shopQnaStore.ts` — Zustand + persist Q&A 스토어. `admin/shop/qna/page.tsx`에서 사용. 초기값으로 상품별 샘플 Q&A 5건 포함 (슈친상사·다이어리·총서). `merge` 전략으로 localStorage 빈 배열 시 초기 데이터 복원. 상품별 필터링 UI 지원.
- **shopReviewStore**: `shared/model/shopReviewStore.ts` — Zustand + persist 리뷰 스토어. `admin/shop/reviews/page.tsx`에서 사용. 초기값으로 상품별 샘플 리뷰 7건 포함 (1~5점 분포). `merge` 전략 동일 적용. 상품별·별점별 필터링 UI 지원.
- **관리자 게시물 관리**: `admin/community/posts/page.tsx` — `communityStore.fetchPosts()` → `GET /api/v1/posts?page=0&size=50` 실제 API 호출. 상단에 커뮤니티별 게시물 수 카드 표시 (`GET /api/v1/communities` 호출). 커뮤니티 필터 + 검색 동시 지원. **전체 보기(`communityFilter === 'all'`)** 시 커뮤니티별 그룹화 표시 (커뮤니티 헤더 + 건수 뱃지 + 좌측 border 구분선).
- **커뮤니티 mock 제거 완료**: `community/page.tsx`에서 `POPULAR_COMMUNITIES` 하드코딩 배열 삭제. 우측 사이드바·검색 결과 모두 `GET /api/v1/communities` API 데이터로 대체.
- **커뮤니티 멤버/방문자 카운팅**: `communityStore.ts`에 Zustand persist 적용 (`community-storage` 키). `memberCounts: Record<string, number>` — 가입/탈퇴 시 `incrementMember`/`decrementMember` 호출. `dailyVisitorLog: Record<string, Record<dateKey, number>>` / `weeklyVisitorLog` — `recordVisit(name)` 호출 시 오늘(YYYY-MM-DD) 및 이번 주 월요일 키로 집계. 우측 사이드바에 오늘 방문자 + 주간 방문자 요약 표시. **이전의 `joinedCommunities` 만 persist 했던 방식에서 확장됨.**
- **관리자 UI 색상 통일**: 메인배너·방송일정·유튜브 h2/h3에 `text-gray-900 dark:text-white` 일괄 적용. 방송일정 삭제 버튼 → `bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg` 스타일 변경.
- **방송일정 월 네비게이션**: `page.tsx`의 `viewYear`, `viewMonth` state로 달력 월 제어. 스케줄 API에 year/month 파라미터 전달.
- **광고 플로팅 사이드바**: `page.tsx`의 `adsVisible` state + `localStorage('ads-sidebar-dismissed')` persist. 오른쪽 하단 fixed 패널, X 버튼으로 닫기.
- **Banner TEXT 컬럼**: `Banner.imageUrl`이 `@Column(columnDefinition = "TEXT")`로 변경됨 — base64 이미지 저장 가능.
- **YouTube videoId 파싱**: `extractYoutubeId()` 함수는 `new URL()` 파싱 우선, `?v=` 쿼리 파라미터 추출 후 11자리 `/^[a-zA-Z0-9_-]{11}$/` 패턴 검증 필수. 검증 실패 시 null 반환 + 에러 토스트. 한글 채널명 등 유효하지 않은 videoId 방지 목적 (youtube.com/watch?v=, youtu.be/ 모두 지원).
- **메인 배너 동적 로딩**: `app/page.tsx` 마운트 시 `GET /api/v1/banners` 호출 → `active=true` 배너를 `displayOrder` 순 슬라이더로 표시. API 실패 시 하드코딩 fallback.
- **광고 활성 필터**: `adsStore`의 `Ad` 인터페이스에 `active?: boolean` 필드. `page.tsx`에서 `ads.filter(a => a.active !== false)` 조건으로 활성 광고만 홈화면에 표시. `admin/ads/page.tsx`에 홈 표시 토글 추가.
- **AdminUserController**: `user/controller/AdminUserController.java` — `GET /api/v1/admin/users` (전체 목록 + 페이지네이션), `GET /api/v1/admin/users/search?email=` (이메일 검색) 엔드포인트. `UserRepository`에 `findByEmailContainingIgnoreCase` 추가. `admin/community/members/page.tsx`에서 실제 API 연동 (mock 제거 완료).
- **커뮤니티 사이드바 가입 필터**: `community/page.tsx` 우측 사이드바는 `joinedCommunities`에 포함된 커뮤니티만 표시. 없으면 "가입된 커뮤니티가 없습니다." 표시. `getMemberCount` 내림차순 정렬.
- **커뮤니티 상세 사이드바 방문자 표시**: `community/board/[slug]/page.tsx`의 우측 사이드바에서 Online 섹션 제거 → 멤버수·일간 방문자·주간 방문자 3열 표시. 페이지 마운트 시 `recordVisit(slug)` 자동 호출로 방문자 집계.
- **좋아요 토글 버그 수정**: `PostCard.tsx`에서 `votePost` → `votePostWithApi` 전환. `getVoteState(id)`로 현재 투표 상태 확인 후 버튼 색상 조건부 적용 (upvote 활성→주황색, downvote 활성→파란색, 숫자도 동일 색상 강조).
- **YouTube 트렌딩 날짜 필터**: `admin/trends/_content.tsx` Videos 탭에 일일/일주일/한달 버튼 추가. `published_at` 기반 클라이언트 필터링. 해당 기간 내 영상 없으면 전체 영상 표시. 필터링 후 `view_count` 내림차순 정렬 유지.
- **로그인/로그아웃 토스트 알림**: `Header.tsx`에서 로그아웃 확인 모달의 "로그아웃" 버튼 클릭 시 `toastSuccess('로그아웃 되었습니다.')` 표시. `LoginModal.tsx`에서 로그인 성공 후 `toastSuccess('로그인 되었습니다.')` 표시.
- **홈 커뮤니티 인기글 링크**: `app/page.tsx`의 `<li>` 태그를 `<Link href={/community/board/${encodeURIComponent(category)}}>` 로 감싸 클릭 시 해당 커뮤니티 게시판으로 이동.
- **로그인 모달 텍스트 색상**: `LoginModal.tsx` input에 `text-gray-900 dark:text-white` 추가. 라이트 모드에서 입력 텍스트가 회색으로 보이던 문제 해결.
- **관리자 매거진 관리 탭**: `admin/layout.tsx`에 매거진 관리 메뉴 추가. `admin/magazine/page.tsx` 전면 재작성 — MOCK_MAGAZINES 기반 CRUD(목록·추가·수정·삭제), 카테고리별 아티클 수 통계, 썸네일 미리보기, 삭제 확인 모달.
- **채팅 히트맵 구조**: `admin/chat/_content.tsx` — 히트맵은 "1분 동안 채팅 수"를 막대 그래프로 표현. 색상: 파란(0~20%) → 초록(20~40%) → 노란(40~60%) → 주황(60~80%) → 빨간(80~100%). 정규화 기준은 해당 방송의 최대 분당 채팅 수(절대치가 아닌 방송 내 상대 비교). 스크롤 가능(`overflow-x-auto`), X축 타임라벨(5~30분 간격), 분석 범위 헤더 표시.
- **채팅 피크 감지 기준**: `analysis/services/chat_analyzer.py` — `평균 + 1.5 × 표준편차` 초과 버킷을 피크로 판정(`sigma_factor=1.5`). 연속된 피크 버킷은 하나의 구간으로 병합. 편집 포인트 = 시청자가 동시에 폭발적으로 반응한 순간.
- **채팅 키워드 검색 기능**: 파일 업로드 시 `search_keywords` Form 파라미터(쉼표 구분)를 함께 전송. 백엔드(`routers/chat.py`)에서 파싱 후 `analyzer.analyze(records, search_keywords=kw_list)` 호출. 검색 키워드가 자동 추출 키워드보다 우선 배치됨. `KeywordTimeline` 모델에 `timestamps: List[str]`(등장한 분 단위 타임스탬프 목록) 추가. 프론트엔드 "키워드 타임라인" 탭에서 검색 키워드별 미니 차트 + 타임스탬프 목록(전체 복사 버튼) 표시.
- **yt-dlp 채팅 추출**: YouTube 라이브 아카이브 채팅 추출 시 `yt-dlp --write-subs --sub-lang live_chat --skip-download "URL"` 사용. 생성된 `.live_chat.json`의 `replayChatItemAction.videoOffsetTimeMsec` 기준 `HH:MM:SS` 변환 필요. 채널 설정에서 채팅 리플레이 비활성화 시 추출 불가(Money Comics 채널 등). 변환 샘플: `chat_samples/슈카월드_live_chat.json` (23,943개 메시지).
- **FIXED_CATEGORIES 토픽 고정**: `['경제', '방송', '쇼핑', '자유게시판']`은 `Sidebar.tsx`의 토픽 섹션에만 표시. 커뮤니티 섹션에서는 이 4개를 필터링하여 제외. `board/[slug]/page.tsx`에서 FIXED_CATEGORIES slug는 `recentCommunities` localStorage에 추가되지 않고 가입 버튼도 미표시. `community/page.tsx` 우측 사이드바 커뮤니티 목록에서도 제외.
- **글 상세 페이지 Reddit 스타일**: `PostCard.tsx`에서 클릭 시 `openPostDetail()` 모달 대신 `router.push('/community/board/${subreddit}/comments/${id}')` 페이지 이동. `community/board/[slug]/comments/[postId]/page.tsx`에서 `useCommunityStore.posts`에서 실제 게시물 데이터 표시, 없으면 mock fallback.
- **채팅 분석 분석범위 표시**: Quick stats의 "분석 범위" 값은 `formatDuration(heatmap)` 함수로 계산 — 마지막 timestamp에서 첫 timestamp를 빼서 `N시간 N분` 형식으로 표시 (예: `3시간 10분`). Quick stats 아래 `top_keywords` 뱃지 UI 삭제.
- **채팅 히트맵 hover tooltip 수정**: CSS `group-hover` + `absolute` 방식은 `overflow-x: auto` 부모가 Y축도 강제 clip하여 tooltip이 잘림. `HeatmapChart` 컴포넌트 내 `useState`로 tooltip 상태 관리, `onMouseEnter`/`onMouseMove`/`onMouseLeave`로 마우스 좌표 추적, `position: fixed` + `z-[9999]`로 렌더링하여 overflow 완전 우회. 히트맵·키워드 타임라인 모두 동일 컴포넌트 공유이므로 일괄 적용됨.
- **피크 구간 종료 시간 표기**: `toHMSEnd()` 헬퍼 추가 — `"HH:MM"` → `"HH:MM:59"`. 피크 구간의 end 타임스탬프는 `toHMSEnd()` 사용하여 1분 단위 구간임을 명시(`15:00 ~ 15:59`). 피크 구간 탭은 `peak_count` 내림차순 정렬.
- **키워드 타임라인 자동 추출 섹션 삭제**: 키워드 탭에서 `autoTimelines` 섹션(자동 추출 상위 키워드 뱃지 + 타임라인) 완전 제거. 검색 키워드 타임라인만 표시.
- **편집 마커 내보내기 키워드 기반**: 검색 키워드가 있을 때 편집 마커 테이블/CSV는 키워드별 타임스탬프 기반으로 변경(`keyword, timestamp, count`). 검색 키워드 없으면 기존 피크 기반 테이블 표시. 테이블에 `max-h-80 overflow-y-auto` 스크롤 처리.

## MCP 서버 (`.mcp.json`)

프로젝트 루트 `.mcp.json`에 Claude Code용 MCP 서버가 구성되어 있습니다:

| 서버 | 패키지 | 연결 |
|---|---|---|
| `mysql` | `@benborla29/mcp-server-mysql` | `127.0.0.1:3306 / analysis_trend` |
| `redis` | `@modelcontextprotocol/server-redis` | `redis://localhost:6379` |
| `postgres` | `@modelcontextprotocol/server-postgres` | `POSTGRES_URL` env 참조 |
| `docker` | `mcp-server-docker` | `/var/run/docker.sock` |
