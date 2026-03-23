# analysisTrend 점진적 개선 계획

> 기준: PRD.md v1.0 | 아키텍처 분석: 2026-03-15 | 전략: DDD-lite + 레이어드 아키텍처 + Nginx MSA

## Context

analysisTrend는 Docker Compose 기반 트렌드 분석 플랫폼으로, 프론트엔드(Next.js 16), 백엔드(Spring Boot 3.5), 분석 서비스(FastAPI)로 구성됩니다.

**현재 상태:** 프론트엔드 UI는 대부분 구현 완료(홈, 커뮤니티, 쇼핑, 마이페이지, 관리자 전체)되었으나, 모든 데이터가 컴포넌트 내부에 하드코딩되어 있고, API 추상화 레이어가 없으며, 인터랙션(투표, 장바구니, 검색 등)이 동작하지 않습니다. 백엔드는 OAuth2+JWT 인증만 구현되어 있고, 비즈니스 도메인(커뮤니티, 상품 등)은 미구현입니다.

**목표:** Phase 0(기반 수정)부터 시작해 8단계에 걸쳐 버그 제거 → 타입/API 추상화 → UI/UX → 인터랙션 → 백엔드 확장 → 연동 → 관리자/폴리싱 → 분석 서비스 순으로 점진적 개선합니다.

**완성도**: ~15% (인증 완료, UI 셸 존재, 하드코딩 데이터)

---ㅇ

## 병렬 처리 분류

### ✅ 완전 병렬 가능 (상호 의존 없음)

| 병렬 그룹 | 작업 A | 작업 B | 이유 |
|-----------|--------|--------|------|
| **그룹 1** | Phase 0 (BE 버그/보안 수정) | Phase 1 타입 정의 (`shared/types/`) | FE 타입은 BE와 무관 |
| **그룹 2** | Phase 2 BE 도메인 확장 | Phase 3 UI/UX 개선 | BE API 없어도 UI 작업 가능 |
| **그룹 3** | Phase 2 BE 도메인 확장 | Phase 4 FE 인터랙션 (mock 기반) | mock 데이터로 FE 동작 구현 |
| **그룹 4** | Phase 7 인프라 (Nginx, docker) | Phase 8 분석 서비스 로컬 개발 | 서로 독립적 |
| **그룹 5** | Phase 5 커뮤니티 연동 | Phase 5 쇼핑 연동 | 다른 도메인 |
| **그룹 6** | Phase 5 관리자 페이지 연동 | Phase 5 홈 연동 | 다른 도메인 |

### ⚠️ 부분 병렬 가능 (순서 주의)

| 작업 | 선행 필요 | 병렬 가능 범위 |
|------|-----------|---------------|
| Phase 1 API 클라이언트 (`client.ts`) | Phase 0 CORS 활성화 완료 후 | 타입 정의는 먼저 시작 가능 |
| Phase 4 authStore 연동 | Phase 1 authStore 완료 후 | 다른 스토어(cartStore 등)는 병렬 |
| Phase 5 FE-BE 연동 | Phase 1 + Phase 2 모두 완료 후 | 도메인별로 분리해 순차 가능 |
| Phase 8 분석 서비스 연동 | Phase 7 인프라 완료 후 | 서비스 내부 로직은 선행 가능 |

### ❌ 반드시 순차 (블로킹 의존성)

```
Phase 0 완료
  → Phase 1 API client.ts (CORS 없으면 연동 불가)
      → Phase 5 FE-BE 연동 (API 클라이언트 필요)
          → Phase 6 관리자/폴리싱 (연동 완료 필요)

Phase 2 BE 도메인 완료
  → Phase 5 FE-BE 연동 (API 엔드포인트 필요)

Phase 7 인프라 (Nginx) 완료
  → Phase 8 분석 서비스 프로덕션 연동
```

### 권장 병렬 실행 순서

```
[Week 1]
  작업자 A: Phase 0 (BE 버그·보안·예외처리)
  작업자 B: Phase 1 타입 정의 + mock 분리

[Week 2]
  작업자 A: Phase 2 BE 도메인 (Community, Product, Cart, Admin)
  작업자 B: Phase 3 UI/UX + Phase 4 FE 인터랙션 (mock 기반)

[Week 3]
  작업자 A+B: Phase 5 FE-BE 연동 (도메인별 분리 병렬)

[Week 4]
  작업자 A: Phase 7 인프라 (Nginx, docker-compose)
  작업자 B: Phase 8 분석 서비스

[Week 5]
  Phase 6 폴리싱 (SEO, 에러 페이지, 접근성)
```

---

---

## Phase 간 의존 관계

```
Phase 0 (기반 수정 — 블로커 제거)  ⇄  Phase 1 타입 정의 (병렬 가능)
   ↓
Phase 1 (타입/Mock 분리 + API 클라이언트)
   ↓
Phase 2 (API 추상화/인증)          ⇄  Phase 3 (UI/UX 개선) + Phase 4 (인터랙션) ← 병렬 가능
   ↓                                        ↓
Phase 5 (프론트-백엔드 연동) ← Phase 2 + Phase 3/4 완료 필요
   ↓
Phase 6 (관리자/폴리싱)    ⇄  Phase 7 (인프라) + Phase 8 (분석 서비스) ← 병렬 가능
```

---

## - [x] Phase 0: 기반 수정 (블로커 제거) ★ 완료

### 오버뷰
이후 모든 작업의 전제가 되는 치명적 버그·보안 문제를 해결합니다. 이 Phase 없이는 프론트-백엔드 통신 자체가 불가능합니다.

### 주요 파일 참조
- `backend/src/main/java/backend/global/baseEntity/BaseTimeEntity.java` — `@LastModifiedBy` 버그
- `backend/src/main/java/backend/global/config/SecurityConfig.java` — CORS 비활성화
- `backend/src/main/resources/application.yml` — OAuth 시크릿 평문 노출
- `backend/build.gradle` — 의존성

### 작업 목록

- [x] **BaseTimeEntity 버그 수정** — `@LastModifiedBy` → `@LastModifiedDate` (현재 updatedAt이 null)
- [x] **JpaAuditingConfig 분리** — `global/config/JpaAuditingConfig.java` 신규 생성 (`@EnableJpaAuditing`)
- [x] **시크릿 환경변수화**
  - [x] `application.yml`의 OAuth 시크릿 → `${GOOGLE_CLIENT_SECRET}` 플레이스홀더
  - [x] `backend/.env` 신규 생성 (gitignore)
  - [x] `.env.example` 신규 생성 (공개용)
- [x] **CORS 활성화** — SecurityConfig 주석 해제, `WebMvcConfig.java` 신규 생성
  - [x] 허용 origin: `http://localhost:3000`
  - [x] 허용 메서드: GET, POST, PUT, DELETE, OPTIONS
- [x] **GlobalExceptionHandler + 표준 응답 구조**
  - [x] `global/exception/GlobalExceptionHandler.java` — `@RestControllerAdvice`
  - [x] `global/exception/ErrorCode.java` — enum (POST_NOT_FOUND, DUPLICATE_VOTE 등)
  - [x] `global/exception/ErrorResponse.java`
  - [x] `global/exception/BusinessException.java`, `EntityNotFoundException.java`
  - [x] `global/common/ApiResponse.java` — `{ success, data, message, timestamp }`
  - [ ] `global/common/PageResponse.java`
- [x] **Bean Validation 의존성 추가** — `build.gradle`
  - [x] `implementation 'org.springframework.boot:spring-boot-starter-validation'`
  - [x] `implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'`
  - [x] 제거: `implementation 'org.springframework.boot:spring-boot-starter-batch'` (미사용)
  - [ ] 기존 DTO에 `@NotBlank`, `@Email`, `@Size` 어노테이션 추가
- [x] **.gitignore 보강** — `.env`, `*.env`, `application-secrets.yml` 추가

### 검증 항목

- [ ] `./gradlew test` 통과
- [x] `updatedAt` 필드 정상 저장 확인 (null 아님)
- [x] `curl -H "Origin: http://localhost:3000" http://localhost:8080/api/v1/auth/signup` — CORS 헤더 포함 응답
- [x] `.env` 파일이 `git status`에 미포함
- [ ] Swagger UI (`/swagger-ui.html`) 접속 성공

---

## - [x] Phase 1: Mock 데이터 체계화 및 TypeScript 타입 시스템 구축 ★ 완료

### 오버뷰
각 페이지 컴포넌트 내부에 하드코딩된 mock 데이터를 FSD 패턴에 맞게 중앙 집중화합니다. 도메인별 TypeScript 타입을 정의하고, mock 데이터를 별도 파일로 분리하여 향후 API 교체 시 변경 범위를 최소화합니다. 영어 mock 데이터를 한국어로 변환합니다.

### 주요 파일 참조
- `frontend/src/app/page.tsx` — 가장 많은 하드코딩 데이터 (스케줄, 뉴스, YouTube, 인기글, 상품)
- `frontend/src/app/community/page.tsx` — posts, POPULAR_COMMUNITIES
- `frontend/src/app/shop/page.tsx` — PRODUCTS, CATEGORIES
- `frontend/src/app/mypage/page.tsx` — 주문, 활동 데이터
- `frontend/src/entities/post/ui/PostCard.tsx` — PostProps 인터페이스
- `frontend/src/shared/model/modalStore.ts` — Zustand 스토어 패턴 참조 기준

### 작업 목록

- [x] `frontend/src/shared/types/` 디렉토리 생성 및 도메인 타입 정의
  - [x] `post.ts` — Post, Comment, Vote 인터페이스
  - [x] `user.ts` — User, AuthState 인터페이스
  - [x] `community.ts` — Community, CommunityMember 인터페이스
  - [x] `shop.ts` — Product, Order, CartItem 인터페이스
  - [x] `schedule.ts` — Schedule, BroadcastNews 인터페이스
  - [x] `video.ts` — Video 인터페이스
  - [x] `index.ts` — 전체 re-export
- [x] `frontend/src/shared/mocks/` 디렉토리 생성 및 데이터 분리
  - [x] `posts.ts` — 커뮤니티 게시글 (community/page.tsx에서 추출)
  - [x] `communities.ts` — 커뮤니티 목록
  - [x] `products.ts` — 상품 (shop/page.tsx에서 추출)
  - [x] `videos.ts` — YouTube 비디오 (page.tsx에서 추출)
  - [x] `schedules.ts` — 스케줄/뉴스 (page.tsx에서 추출)
  - [x] `users.ts` — 사용자 데이터
  - [x] `index.ts` — 전체 re-export
- [x] 기존 페이지에서 하드코딩 데이터를 mock import로 교체
  - [x] `app/page.tsx` — SCHEDULE_DAYS, MOCK_VIDEOS, SHOP_PREVIEW_ITEMS
  - [x] `app/community/page.tsx` — posts, POPULAR_COMMUNITIES
  - [x] `app/shop/page.tsx` — PRODUCTS, CATEGORIES
  - [x] `app/mypage/page.tsx` — 주문/활동 데이터 (`shared/mocks/mypage.ts`로 분리)
  - [ ] 관리자 페이지들 — 배너, 스케줄, 광고, YouTube, 멤버 데이터
- [x] PostCard Props를 `shared/types/post.ts`의 Post 타입으로 통일
- [x] 영어 mock 데이터를 한국어로 번역

### 검증 항목

- [x] TypeScript 타입 검사 통과 (`tsc --noEmit` 에러 없음)
- [x] 모든 페이지 정상 렌더링 확인 (`/`, `/community`, `/shop`, `/mypage`, `/admin/*`)
- [x] 페이지 컴포넌트에 하드코딩된 데이터가 없고, 모두 `shared/mocks/`에서 import
- [x] 모든 컴포넌트가 `shared/types/`의 타입을 참조
- [ ] `npm run lint` 에러 없음

---

## - [x] Phase 2: API 추상화 레이어 및 인증 상태 관리 ★ 완료

### 오버뷰
실제 백엔드 연동을 위한 API 클라이언트 추상화 레이어를 구축합니다. `LoginModal`에서 직접 fetch하는 방식을 Zustand 기반 인증 스토어로 교체하고, mock/실제 API를 플래그 하나로 전환할 수 있는 구조를 만듭니다.

### 주요 파일 참조
- `frontend/src/features/auth/ui/LoginModal.tsx` — 현재 유일한 API 통신 코드 (fetch 직접 호출)
- `frontend/src/shared/model/modalStore.ts` — Zustand 스토어 패턴 참조
- `frontend/src/widgets/Header/Header.tsx` — 인증 상태에 따른 UI 변경 필요
- `frontend/src/app/ModalProvider.tsx` — 모달 중앙 관리

### 작업 목록

- [x] `frontend/src/shared/api/` 디렉토리 생성
  - [x] `client.ts` — fetch wrapper (baseURL, 헤더, 토큰 자동 주입, 에러 핸들링)
  - [x] `endpoints.ts` — API 엔드포인트 상수 (`/api/v1/auth/login` 등)
  - [x] `index.ts` — re-export
- [x] `frontend/src/shared/api/mock/` 디렉토리 생성
  - [x] `mockApi.ts` — mock 데이터를 Promise로 반환하는 함수들
  - [x] `delay.ts` — 네트워크 지연 시뮬레이션 유틸리티
  - [x] `config.ts` — `USE_MOCK_API = true` 플래그
- [x] `frontend/src/shared/model/authStore.ts` — Zustand 인증 스토어
  - [x] 상태: user, accessToken, isAuthenticated, isLoading
  - [x] 액션: login, logout, checkAuth
  - [x] localStorage persist
- [x] Header 컴포넌트 인증 상태 반영
  - [x] 로그인 시: 사용자 닉네임/아바타 이니셜 + 로그아웃 버튼 (데스크탑/모바일)
  - [x] 비로그인 시: 기존 Log In 버튼
- [x] LoginModal을 authStore 사용으로 리팩토링 (직접 fetch 제거)
- [x] 커뮤니티/상품 도메인 API 서비스 함수 정의
  - [x] `entities/post/api/postApi.ts` — getPosts, getPostById, createPost, votePost
  - [x] `entities/product/api/productApi.ts` — getProducts, getProductById
- [ ] 로그인 모달 열기를 Zustand 모달 스토어에서 통합 관리

### 검증 항목

- [x] 로그인/회원가입이 mock API로 정상 동작
- [x] 로그인 후 Header에 사용자 정보 표시, 로그아웃 시 로그인 버튼 복귀
- [x] 페이지 새로고침 시 인증 상태 유지 (localStorage persist)
- [x] `USE_MOCK_API` 플래그 전환 시 mock/실제 API 정상 전환
- [x] TypeScript 타입 검사 통과

---

## - [x] Phase 3: 프론트엔드 UI/UX 개선 및 누락 페이지 구현 ★ 완료

### 오버뷰
누락된 페이지(Magazine, About)를 구현하고, 로딩/에러 상태 UI, 404 페이지, 다크모드 토글, 모바일 반응형 네비게이션을 추가합니다.

### 주요 파일 참조
- `frontend/src/app/layout.tsx` — 루트 레이아웃, metadata 수정 대상
- `frontend/src/widgets/Header/Header.tsx` — 모바일 햄버거 메뉴, 다크모드 토글 추가
- `frontend/src/shared/ui/Button.tsx` — CVA 패턴 참조 (새 UI 컴포넌트 작성 시)
- `frontend/src/shared/mocks/` — 새 페이지용 mock 데이터 추가

### 작업 목록

**✅ 완료된 항목 (2026-03-15):**
- [x] 모바일 반응형 네비게이션 — Header 오른쪽 슬라이드 드로어 메뉴 추가 (`widgets/Header/ui/Header.tsx`)
- [x] 관리자 레이아웃 섹션 재구성 — 콘텐츠/분석도구/운영 섹션, 모바일 햄버거 메뉴 (`app/admin/layout.tsx`)
- [x] 페르소나 C 채널 분석 페이지 한국화 — KPI 카드, 구독자 차트, 인기영상, AI 인사이트 (`app/admin/analysis/page.tsx`)
- [x] 페르소나 C/E 트렌드 분석 페이지 신규 생성 — 뉴스 키워드, YouTube 트렌딩, 뉴스 원문+AI 요약 (`app/admin/trends/page.tsx`)
- [x] 페르소나 D 채팅 분석 페이지 신규 생성 — 파일 업로드, 히트맵, 피크 구간, 키워드 타임라인, CSV 편집마커 다운로드 (`app/admin/chat/page.tsx`)
- [x] 쇼핑 상품 상세 옵션 누적 선택 — `SelectedItem[]` 배열로 복수 옵션+수량 관리, 삭제 버튼, Total Amount 연동 (`app/shop/[id]/page.tsx`)
- [x] 이미지 슬라이더 — prev/next 버튼, 도트 인디케이터, 이미지 카운터 배지 (`app/shop/[id]/page.tsx`)

- [x] Magazine 페이지 구현
  - [x] `app/magazine/page.tsx` — 매거진 카드 그리드, 카테고리 필터
  - [x] `app/magazine/[id]/page.tsx` — 매거진 상세
  - [x] `shared/mocks/magazines.ts` — mock 데이터
  - [x] `shared/types/magazine.ts` — Magazine 타입
- [x] About 페이지 구현
  - [x] `app/about/page.tsx` — 서비스 소개, 정적 콘텐츠
- [x] 로딩 상태 UI 컴포넌트 — `shared/ui/`
  - [x] `Skeleton.tsx` — 스켈레톤 로더 (카드, 텍스트, 이미지 변형)
  - [x] `Spinner.tsx` — 스피너
- [x] 에러 상태 UI
  - [x] `app/not-found.tsx` — 404 페이지
  - [x] `app/error.tsx` — 전역 에러 바운더리
  - [x] `shared/ui/ErrorMessage.tsx` — 인라인 에러 메시지
- [x] 다크모드 토글 구현
  - [x] `shared/model/themeStore.ts` — Zustand 테마 스토어
  - [x] Header에 토글 버튼 추가
  - [x] `html` 태그에 class="dark" 동적 적용
- [x] 모바일 반응형 네비게이션 — Header에 햄버거 메뉴 추가
- [x] Header 네비게이션 링크의 `href="#"`을 실제 경로(`/magazine`, `/about`)로 변경
- [x] `layout.tsx` metadata 수정 (title: "AnalysisTrend - 트렌드 분석 플랫폼")

### 검증 항목

- [x] `/magazine` 페이지 정상 렌더링
- [x] `/about` 페이지 정상 렌더링
- [x] 존재하지 않는 URL 접속 시 404 페이지 표시
- [x] 다크모드 토글 동작 (라이트↔다크 전환)
- [x] 모바일(375px)에서 햄버거 메뉴 동작
- [x] 스켈레톤/스피너 컴포넌트 존재
- [ ] `npm run build` 성공 (Turbopack 한글 경로 버그 — `tsc --noEmit` 에러 없음 확인됨)

---

## - [x] Phase 4: 프론트엔드 인터랙션 강화 및 상태 관리 고도화 ★ 완료

### 오버뷰
커뮤니티 글 작성/투표/댓글, 쇼핑 장바구니, 검색/필터 등 사용자 인터랙션을 mock 데이터 기반으로 실제 동작하도록 구현합니다. Toast 알림 시스템을 추가합니다.

### 주요 파일 참조
- `frontend/src/shared/model/modalStore.ts` — Zustand 스토어 패턴 참조
- `frontend/src/features/post/ui/CreatePostModal.tsx` — 글 작성 모달 (현재 UI만)
- `frontend/src/features/post/ui/PostDetailModal.tsx` — 글 상세 모달 (댓글 UI만)
- `frontend/src/entities/post/ui/PostCard.tsx` — 투표 버튼 (현재 동작 안함)
- `frontend/src/app/community/page.tsx` — Best/Hot/New/Top 필터 (현재 UI만)
- `frontend/src/app/shop/page.tsx` — 카테고리 필터, 페이지네이션 (현재 UI만)
- `frontend/src/features/search/ui/CommunitySearch.tsx` — 검색 컴포넌트

### 작업 목록

- [x] 커뮤니티 Zustand 스토어 — `shared/model/communityStore.ts`
  - [x] 상태: posts, communities, selectedFilter
  - [x] 액션: addPost, votePost, addComment, setFilter, getSortedPosts
- [x] 커뮤니티 글 작성 동작 연결
  - [x] CreatePostModal 제출 → communityStore.addPost → 피드에 반영
- [x] 투표(upvote/downvote) 동작 — PostCard 화살표 클릭 시 숫자 변경
- [x] 댓글 작성 동작 — PostDetailModal에서 댓글 입력/추가 (`communityStore.addComment` 연결)
- [x] 커뮤니티 필터 동작 — Best/Hot/New/Top 버튼에 정렬 로직 연결
- [x] 쇼핑 장바구니 스토어 — `shared/model/cartStore.ts`
  - [x] 상태: items, totalPrice
  - [x] 액션: addItem, removeItem, updateQuantity
- [x] 쇼핑 카테고리 필터 동작 — 버튼 클릭 시 상품 필터링
- [x] 쇼핑 페이지네이션 동작 (`PAGE_SIZE=6`, 동적 totalPages)
- [x] 검색 기능 강화
  - [x] CommunitySearch 디바운스 적용 (300ms `useRef` 타이머)
  - [x] `/shop` 페이지에 검색바 추가 (300ms 디바운스, 카테고리 AND 조건)
- [x] 마이페이지 인터랙션
  - [x] 프로필 수정 (닉네임, 자기소개) → authStore에 저장
  - [x] 주문 필터 탭 동작 (상태별 필터링)
- [x] Toast/Notification 시스템 — `shared/ui/Toast.tsx`
  - [x] Zustand 스토어: `shared/model/toastStore.ts`
  - [x] "글이 작성되었습니다" 등 피드백 + ToastContainer 전역 등록

### 검증 항목

- [x] 커뮤니티 글 작성 → 피드에 새 글 표시
- [x] 투표 버튼 클릭 → 숫자 증감
- [x] 댓글 작성 → 댓글 목록에 추가
- [x] 장바구니 추가/삭제/수량변경 동작
- [x] 카테고리 필터 및 페이지네이션 동작
- [x] 필터 정렬 (Best/Hot/New/Top) 동작
- [x] Toast 알림 표시
- [ ] `npm run build` 성공 (Turbopack 한글 경로 버그 — `tsc --noEmit` 에러 없음 확인됨)

---

## - [x] Phase 5: 백엔드 도메인 확장 (커뮤니티, 게시물, 상품) ★ 완료

### 오버뷰
백엔드에 커뮤니티/게시물/상품 도메인을 구현합니다. CORS를 활성화하고 RESTful API를 제공합니다. 이 단계는 Phase 4와 병렬 진행 가능합니다. 프론트엔드 연동은 Phase 6에서 진행합니다.

### 주요 파일 참조
- `backend/src/main/java/backend/global/config/SecurityConfig.java` — CORS 활성화, API 인가 규칙 수정
- `backend/src/main/java/backend/user/controller/AuthController.java` — 컨트롤러 패턴 참조
- `backend/src/main/java/backend/user/domain/User.java` — 엔티티 패턴 참조
- `backend/src/main/java/backend/global/baseEntity/BaseTimeEntity.java` — JPA 감사 베이스 클래스
- `backend/build.gradle` — 의존성 확인

### 작업 목록

- [x] CORS 설정 활성화 — SecurityConfig에서 주석 해제 및 설정
  - [x] 허용 origin: `http://localhost:3000`, `http://localhost` (Nginx 포트 80 환경)
  - [x] 허용 메서드: GET, POST, PUT, DELETE, OPTIONS
- [x] Community 도메인 — `backend/src/main/java/backend/community/`
  - [x] `domain/Community.java` — id, name, description, memberCount, createdAt
  - [x] `repository/CommunityRepository.java`
  - [x] `service/CommunityService.java` — CRUD
  - [x] `controller/CommunityController.java` — `/api/v1/communities`
  - [x] `dto/` — CreateCommunityRequest, CommunityResponse
- [x] Post 도메인 — `backend/src/main/java/backend/post/`
  - [x] `domain/Post.java` — id, title, content, author(User), community, upvotes, createdAt
  - [x] `domain/Comment.java` — id, content, author(User), post, parentComment, createdAt
  - [x] `domain/Vote.java` — id, user, post, voteType(UP/DOWN), 유니크 제약
  - [x] `repository/` — PostRepository, CommentRepository, VoteRepository
  - [x] `service/PostService.java` — CRUD, 투표(타입 변경 포함), 정렬(Hot/New/Top)
  - [x] `controller/PostController.java` — `/api/v1/posts`
  - [x] `controller/CommentController.java` — `/api/v1/posts/{id}/comments`
- [x] Product 도메인 — `backend/src/main/java/backend/product/`
  - [x] `domain/Product.java` — id, name, price, originalPrice, discount, category, isSoldOut
  - [x] `domain/ProductCategory.java` — enum (GOODS, FOOD, FASHION, DIGITAL, ALL)
  - [x] `repository/ProductRepository.java`
  - [x] `service/ProductService.java` — 목록 조회, 카테고리 필터
  - [x] `controller/ProductController.java` — `/api/v1/products`
- [x] SecurityConfig 업데이트 — 새 API 경로 인가 규칙
  - [x] GET `/api/v1/communities/**`, `/api/v1/posts/**`, `/api/v1/products/**` → permitAll
  - [x] GET `/swagger-ui/**`, `/v3/api-docs/**` → permitAll
  - [x] POST/PUT/DELETE → authenticated
- [x] 글로벌 예외 처리 — `global/exception/`
  - [x] `GlobalExceptionHandler.java` — @RestControllerAdvice
  - [x] `ErrorResponse.java` — 통일된 에러 응답 DTO

### 검증 항목

- [x] `./gradlew compileJava` 성공
- [x] `./gradlew test` 전체 통과 (JUnit 19개)
- [x] API 엔드포인트 테스트 (docker-compose 기동 후 E2E 확인)
  - [x] GET `/api/v1/communities` → 200
  - [x] POST `/api/v1/posts` (with JWT) → 201
  - [x] GET `/api/v1/products` → 200
  - [x] GET `/api/v1/products?category=FOOD` → 필터된 결과
- [x] CORS 헤더 확인 (`Access-Control-Allow-Origin: http://localhost:3000`)

---

## - [x] Phase 6: 프론트엔드-백엔드 연동 ★ 완료

### 오버뷰
Phase 2의 API 추상화 레이어에서 mock 플래그를 끄고 실제 백엔드 API와 연동합니다. 환경 변수로 mock/실제 API를 전환할 수 있도록 합니다. 토큰 재발급, 에러 핸들링을 통합합니다.

### 주요 파일 참조
- `frontend/src/shared/api/client.ts` — API 클라이언트 (Phase 2에서 생성)
- `frontend/src/shared/api/mock/config.ts` — USE_MOCK_API 플래그
- `frontend/src/shared/model/authStore.ts` — 인증 스토어 (Phase 2에서 생성)
- `frontend/src/shared/model/communityStore.ts` — 커뮤니티 스토어 (Phase 4에서 생성)
- `frontend/src/app/oauth/callback/page.tsx` — OAuth 콜백 처리

### 작업 목록

- [x] 환경 변수 설정 — `.env.local`
  - [x] `NEXT_PUBLIC_API_URL=http://localhost:8080`
  - [x] `NEXT_PUBLIC_USE_MOCK=false`
- [x] API 클라이언트 실제 연동 — `shared/api/client.ts` 수정
  - [x] baseURL을 환경 변수에서 가져오기
  - [x] 401 응답 시 토큰 재발급 자동 시도
  - [x] 재발급 실패 시 로그아웃 및 로그인 모달 표시
- [x] 인증 연동
  - [x] authStore의 login/signup을 실제 API 호출로 변경
  - [x] OAuth2 콜백 로직 점검 및 authStore 연동
  - [x] Refresh token 갱신 로직
- [x] 커뮤니티 연동
  - [x] communityStore 데이터 소스를 API로 전환
  - [x] 글 작성/수정/삭제 API 호출
  - [x] 투표/댓글 API 호출
- [x] 상품 연동 — productApi mock을 실제 API로 전환
- [x] Sidebar 커뮤니티 목록 API 연동 (`USE_MOCK_API` 플래그 분기, 실패 시 mock fallback)
- [x] 에러 핸들링 통합 — 네트워크 에러·5xx 에러 시 Toast 표시 (`client.ts`에 통합)

### 검증 항목

- [x] `docker-compose up -d` 후 전체 서비스 정상 기동
- [x] 회원가입 → 로그인 → 토큰 저장 → 인증된 요청 플로우 동작
- [ ] OAuth2 로그인 (Google/Kakao/Naver) 플로우 동작
- [x] 글 작성 → 목록 확인 → 상세 조회 → 댓글 작성 플로우
- [x] 상품 목록 → 카테고리 필터 → 상세 조회 플로우
- [x] `NEXT_PUBLIC_USE_MOCK=true` 전환 시 mock 모드 정상 동작
- [ ] `npm run build` 성공

---

## - [x] Phase 7: 관리자 기능 구현 및 전체 폴리싱 ★ 완료

### 오버뷰
관리자 페이지 CRUD를 실제로 동작하도록 구현하고, SEO, 성능 최적화, 접근성 개선 등 전체 폴리싱을 진행합니다. Analysis 서비스에 기초 트렌드 분석 엔드포인트를 추가합니다.

### 주요 파일 참조
- `frontend/src/app/admin/layout.tsx` — 관리자 레이아웃 + 라우트 가드
- `frontend/src/app/admin/banner/page.tsx` — 배너 관리 (API 연동 완료)
- `frontend/src/app/admin/schedule/page.tsx` — 스케줄 관리 (API 연동 완료)
- `frontend/src/app/admin/youtube/page.tsx` — YouTube 관리 (API 연동 완료)
- `backend/src/main/java/backend/global/config/SecurityConfig.java` — 관리자 권한 체크
- `backend/src/main/java/backend/banner/` — Banner 도메인
- `backend/src/main/java/backend/schedule/` — Schedule 도메인
- `backend/src/main/java/backend/youtube/` — YoutubeVideo 도메인

### 작업 목록

- [x] 관리자 API 구현 (백엔드)
  - [x] `/api/v1/admin/banners` — 배너 CRUD (`BannerController`)
  - [x] `/api/v1/admin/banners/{id}/toggle` — 배너 활성/비활성 토글 (`PATCH`)
  - [x] `/api/v1/admin/schedules` — 스케줄 CRUD (`ScheduleController`)
  - [x] `/api/v1/admin/youtube` — YouTube 영상 CRUD (`YoutubeVideoController`)
  - [x] `@PreAuthorize("hasRole('ADMIN')")` 권한 체크 + `@EnableMethodSecurity`
  - [x] `SecurityConfig` — `/api/v1/admin/**` hasRole("ADMIN") 경로 보호
- [x] 관리자 페이지 기능 연결 (프론트엔드)
  - [x] `/admin/banner` — 배너 CRUD 폼 + API 연동 (활성/비활성 토글 포함)
  - [x] `/admin/schedule` — 스케줄 추가/수정/삭제 (날짜 picker, 유형 select)
  - [x] `/admin/youtube` — YouTube 영상 추가/수정/삭제
  - [x] `/admin/chat` — 채팅 파일 업로드 → 실제 분석 API (`POST /analyze/chat`) 연동
  - [x] `/admin/trends` — 뉴스 키워드·YouTube 트렌딩 실시간 데이터 연동 (`/trends/news`, `/trends/youtube`)
  - [x] `/admin/ads` — 광고 슬롯 관리 UI 구현 완료 (BE API 없음)
  - [x] `/admin/community/members` — 회원 목록 UI 구현 완료
- [x] 관리자 라우트 가드 — `admin/layout.tsx`에서 비인증/비관리자 접근 시 `/` 리다이렉트
- [x] `shared/api/client.ts` 확장
  - [x] `analysisPostForm<T>` — 분석 서비스 multipart/form-data 업로드 헬퍼
  - [x] `analysisGet<T>` — 분석 서비스 GET 헬퍼 (query params 지원)
  - [x] `ANALYSIS_BASE_URL` — `NEXT_PUBLIC_ANALYSIS_URL || 'http://localhost:8000'`
- [x] SEO 최적화
  - [x] `layout.tsx` 루트 metadata (title, description, keywords, openGraph)
  - [x] `frontend/public/robots.txt` — 크롤러 허용/차단, sitemap 경로 지정
  - [x] `frontend/src/app/sitemap.ts` — Next.js 동적 사이트맵 (5개 정적 라우트)
  - [x] 각 페이지별 추가 metadata — `community/layout.tsx`, `shop/layout.tsx`, `mypage/layout.tsx` 신규 생성
- [x] 성능 최적화
  - [x] Next.js Image 컴포넌트 활용 — `next.config.ts` Unsplash `remotePatterns` 추가, `magazine/page.tsx` Image 적용
  - [x] 관리자 페이지 dynamic import (`next/dynamic`, `ssr: false`)
    - [x] `admin/chat/page.tsx` → `_content.tsx` 분리 + lazy load (파일 업로드 브라우저 전용 API)
    - [x] `admin/trends/page.tsx` → `_content.tsx` 분리 + lazy load (useEffect/API 호출)
- [x] 접근성(a11y) 개선
  - [x] 아이콘 전용 버튼 `aria-label` 추가 (투표 버튼, 닫기 버튼, CSV 다운로드 버튼 등)
  - [x] 모달에 `role="dialog"`, `aria-modal="true"` 추가 (LoginModal, CreatePostModal, PostDetailModal)
  - [x] 모달 Escape 키 닫기 (`onKeyDown` → `e.key === 'Escape'`)
  - [x] 탭 패널 `role="tablist/tab/tabpanel"` (admin/chat, admin/trends)
  - [x] SVG 아이콘 `aria-hidden="true"` 처리
  - [x] 에러 메시지 `role="alert"`, 진행바 `role="progressbar"` 추가
  - [x] 모달 Tab 포커스 트랩 구현 완료 (LoginModal, CreatePostModal, PostDetailModal)

### 검증 항목

- [x] 관리자 로그인 후 배너/스케줄/YouTube CRUD 동작
- [x] 비관리자로 `/admin` 접속 시 리다이렉트
- [x] `robots.txt` / `sitemap.ts` 접근 가능 (빌드 후 `/robots.txt`, `/sitemap.xml`)
- [x] admin/chat, admin/trends dynamic import 적용 (`ssr: false`, 로딩 스피너)
- [x] 모달 Escape 키 닫기 동작
- [x] `npx tsc --noEmit` 타입 오류 없음
- [x] 모달 포커스 트랩 동작 확인
- [ ] 전체 사이트 키보드 네비게이션 가능
- [ ] `npm run build` 성공 (Turbopack 한글 경로 버그 — Docker 내부에서 빌드 가능)
- [x] `./gradlew build` 성공
- [x] `docker-compose up -d` 후 전체 서비스 정상 기동

---

## - [x] Phase 8 (★ Phase 7과 병렬 가능): 인프라 개선 ★ 완료

### 오버뷰
Nginx 리버스 프록시를 추가해 단일 진입점(포트 80)을 구성하고, docker-compose를 운영 수준으로 개선합니다. Phase 7 관리자/폴리싱과 병렬 진행 가능합니다.

### 주요 파일 참조
- `docker-compose.yml` — 포트 직접 노출 (3306, 6379, 8080, 8000, 3000 모두 열려있음)
- `backend/Dockerfile`, `frontend/Dockerfile`
- `backend/src/main/resources/application.yml` — 환경 프로필 분리 필요

### 작업 목록

- [x] **Nginx 리버스 프록시** — `nginx/nginx.conf` 생성
  - [x] `/` → `frontend:3000`
  - [x] `/api/`, `/oauth2/`, `/login/` → `backend:8080`
  - [x] `/analyze/`, `/trends/`, `/analytics/` → `analysis:8000`
  - [x] `client_max_body_size 50M` (채팅 파일 업로드)
- [x] **docker-compose.yml 개선**
  - [x] `nginx` 서비스 추가 (포트 80만 외부 노출)
  - [x] mysql, redis, backend, analysis, frontend → `expose` (내부 전용)
  - [x] 각 서비스 `env_file` 참조 추가
  - [x] MySQL `healthcheck` 추가
  - [x] backend `depends_on: mysql: condition: service_healthy`
  - [x] DB URL에 `serverTimezone=Asia/Seoul` 추가
- [x] **환경 변수 파일 구조 정리**
  - [x] `backend/.env` (gitignore) — JWT, OAuth 시크릿
  - [x] `analysis/.env` (gitignore) — Naver API 키, YouTube API 키
  - [x] `frontend/.env.local` (gitignore)
  - [x] `backend/.env.example`, `analysis/.env.example`, `frontend/.env.local.example`
- [ ] **application.yml 프로필 분리**
  - [x] `application-dev.yml` — `ddl-auto: update`, 콘솔 로깅
  - [x] `application-prod.yml` — `ddl-auto: validate`, JSON 로깅

### 검증 항목

- [x] `docker-compose up -d` 후 `http://localhost` (포트 80) 접속 성공
- [ ] 외부에서 3306, 6379, 8080, 8000, 3000 직접 접근 불가 확인
- [x] 50MB 이하 파일 Nginx 통과 확인
- [x] `docker ps` — 모든 컨테이너 healthy 상태

---

## - [x] Phase 9 (★ Phase 8과 병렬 가능): 분석 서비스 구현 ★ 완료

### 오버뷰
FastAPI 분석 서비스에 채팅 분석, 뉴스 키워드 수집, YouTube 급상승 수집을 구현합니다. 이것이 PRD의 핵심 차별화 기능입니다. Phase 8 인프라와 병렬로 로컬 개발 진행 가능합니다.

### 주요 파일 참조
- `analysis/main.py` — 헬스체크만 존재
- `analysis/requirements.txt` — fastapi, uvicorn 2개만
- `analysis/Dockerfile`

### 작업 목록

- [x] **분석 서비스 모듈화**
  - [x] `analysis/config.py` — pydantic-settings 환경 변수
  - [x] `analysis/routers/` — `health.py`, `chat.py`, `trends.py`
  - [x] `analysis/services/` — `chat_analyzer.py`, `news_collector.py`, `youtube_collector.py`, `cache.py`
  - [x] `analysis/parsers/` — `base.py`, `csv_parser.py`, `json_parser.py`, `txt_parser.py` (Strategy 패턴)
  - [x] `analysis/models/` — `chat.py`, `trend.py` (Pydantic 모델)
  - [x] `analysis/tasks/scheduler.py` — APScheduler (`AsyncIOScheduler`, 30분 주기 뉴스 수집)
  - [x] `analysis/main.py` — FastAPI lifespan (`start_scheduler` / `stop_scheduler`)

- [x] **requirements.txt 확장**
  - [x] `httpx>=0.27.0` — 외부 API 비동기 호출
  - [x] `redis>=5.0` — 캐시
  - [x] `apscheduler>=3.10.0` — 30분 주기 스케줄러
  - [x] `soynlpy>=0.0.493` — 한국어 NLP
  - [x] `scikit-learn>=1.4.0` — TF-IDF
  - [x] `numpy>=1.26.0`
  - [x] `python-multipart>=0.0.9` — 파일 업로드

- [x] **채팅 분석 파이프라인 (CHAT-01~05, PRD 핵심 차별화)**
  - [x] `POST /analyze/chat` — 파일 업로드 엔드포인트 (`chat.py`)
  - [x] CSV/JSON/TXT 파서 (Strategy 패턴, BOM/인코딩 자동 감지)
  - [x] 시간 버킷 집계 + 정규화 (normalized 0.0~1.0)
  - [x] TF-IDF 자동 키워드 추출 (`top_keywords`)
  - [x] 피크 감지: 평균 + 2σ 초과 버킷 → `peaks` 반환
  - [x] 결과 Redis 저장 (TTL 1시간, key: `chat:{session_id}`)
  - [x] `GET /analyze/chat/session/{session_id}` — 캐시 조회 엔드포인트
  - [ ] 50MB 이상 비동기 처리: `task_id` 폴링 (미구현)

- [x] **뉴스 키워드 수집 (TRD-02)**
  - [x] APScheduler 30분 주기 실행 (`tasks/scheduler.py`)
  - [x] Naver News API 수집 (`news_collector.py`)
  - [x] Redis 저장 (Key: `news_keywords`, TTL: 30분)
  - [x] `GET /trends/news` 엔드포인트

- [x] **YouTube 급상승 수집 (TRD-01)**
  - [x] YouTube Data API v3 `videos.list?chart=mostPopular` (`youtube_collector.py`)
  - [x] 파라미터: regionCode, videoCategoryId, maxResults=20
  - [x] Redis 캐시 (Key: `trending_{regionCode}_{categoryId}`, TTL: 30분)
  - [x] `GET /trends/youtube?region=KR&category=25` 엔드포인트
  - [x] `GET /trends/keywords` — 뉴스+YouTube 통합 키워드 엔드포인트

- [x] **프론트엔드 분석/트렌드 페이지 연동**
  - [x] `admin/chat/page.tsx` — 채팅 파일 업로드 → 실제 분석 API → 히트맵/피크/키워드 표시 + CSV 다운로드
  - [x] `admin/trends/page.tsx` — 실시간 `/trends/news`, `/trends/youtube` 데이터 연동, 새로고침 버튼
  - [ ] Recharts 히트맵 시각화 (현재 CSS 바 차트 사용)

- [x] **테스트**
  - [x] `analysis/tests/test_parsers.py` — CSV/JSON/TXT 파서 15개 케이스
  - [x] `analysis/tests/test_chat_analyzer.py` — 분석 파이프라인 12개 케이스
  - [x] `analysis/tests/test_cache.py` — Redis 캐시 모킹 9개 케이스
  - [x] `frontend/src/__tests__/authStore.test.ts`
  - [x] `frontend/src/__tests__/communityStore.test.ts`
  - [x] `frontend/src/__tests__/cartStore.test.ts`
  - [x] `frontend/src/__tests__/toastStore.test.ts`
  - [x] `frontend/src/__tests__/themeStore.test.ts`

### 검증 항목

- [x] 샘플 CSV 업로드 → heatmap, keywords, peaks 응답 (실제 API 연동 완료)
- [x] `GET /trends/news` → 키워드 반환 (Naver API 키 환경변수 필요)
- [x] `GET /trends/youtube?region=KR` → 영상 반환 (YouTube API 키 환경변수 필요)
- [x] 편집 마커 CSV 다운로드 성공 (`start, end, peak_count, keywords` 형식)
- [ ] Redis에 `news_keywords` 키 존재 확인 (실서버 기동 시)

---

## - [x] Phase 10: E2E 테스트 (Playwright) ★ 완료

### 오버뷰
Playwright 기반 E2E 테스트 인프라를 구축하고 PRD 기능 ID 기준 73개 테스트 케이스를 작성·실행합니다.
테스트 상세 체크리스트 및 실행 결과는 **`e2e/TEST_PLAN.md`** 에서 관리합니다.

### 구조
- `e2e/playwright.config.ts` — guest/user/admin 프로젝트 분리, `storageState` 기반 인증
- `e2e/pages/` — Page Object Model (11개 클래스)
- `e2e/fixtures/` — auth·community 픽스처, 통합 index.ts
- `e2e/tests/` — 17개 스펙 파일 (PRD 기능 ID 기준 분류)
- `e2e/helpers/` — ApiHelper (데이터 시드), DbHelper

### 작업 목록

- [x] Playwright 인프라 세팅 (`e2e/package.json`, `playwright.config.ts`, `tsconfig.json`)
- [x] Page Object Model 클래스 작성 (LoginModal, HomePage, CommunityPage, PostDetailModal, ShopPage, ProductDetailPage, MyPage, AdminLayout, BannerPage, ChatAnalysisPage, TrendsPage)
- [x] fixtures 작성 (auth.fixture.ts, community.fixture.ts)
- [x] helpers 작성 (ApiHelper, DbHelper)
- [x] 17개 스펙 파일 작성 완료
- [x] 샘플 채팅 CSV 생성 (`fixtures/sample-chat.csv`)
- [x] `global-setup.ts` — API 직접 호출 + localStorage 주입 방식으로 storageState 저장
- [x] AUTH 테스트 작성 및 실행 (9개 / 9 통과)
- [x] HOME 테스트 작성 및 실행 (5개 / 5 통과)
- [x] COMMUNITY 테스트 작성 및 실행 (17개 / 17 통과)
- [x] SHOP 테스트 작성 및 실행 (13개 / 12 통과, 1 skip — 옵션 없는 상품)
- [x] MYPAGE 테스트 작성 및 실행 (5개 / 4 통과, 1 skip — 주문 필터 탭 없음)
- [x] ADMIN 테스트 작성 및 실행 (24개 / 17 통과, 7 skip — CRUD 체인 의존성)

### 핵심 해결 사항 (2026-03-19)

- **Zustand `_hasHydrated`** — `authStore.ts`에 persist 하이드레이션 완료 플래그 추가 → `admin/layout.tsx` race condition 해결
- **`frontend/.dockerignore`** — `.env.local`(MOCK=true) Docker 빌드 제외
- **백엔드 `AuthController`** — 로그인 응답에 `role` 필드 추가
- **`global-setup.ts`** — UI 로그인 대신 API 직접 호출 + `page.evaluate()` localStorage 주입

### 검증 항목

- [x] `cd e2e && npm test` — **73개 중 64 통과, 9 skip, 0 실패** (2026-03-19)
- [x] Playwright HTML 리포트 생성 (`npm run test:report`)
- [ ] CI 환경에서 `docker-compose up -d` 후 자동 실행 (GitHub Actions 미설정)

---

## Team Agent 병렬 처리 구성

### 4개 팀 × 4 Wave

| 팀 | 역할 | 담당 Phase |
|---|---|---|
| **Team A** `backend-core` | BE 전문 | 0 → 5 → 6(BE) → 7(BE) |
| **Team B** `frontend-data` | FE 데이터 레이어 | 1 → 2 → 6(FE) → 7(FE) |
| **Team C** `frontend-ux` | FE 경험/인터랙션 | 3선작업 → 3+4 → 6(UX) → 7(폴리싱) |
| **Team D** `infra-analysis` | 인프라+분석 | 설계 → 9로컬 → 8+9 → 9연동 |

### Wave별 실행 계획

```
Wave 1 (Week 1)
  Team A: Phase 0 (BE 기반 수정) ★ 블로커 제거
  Team B: Phase 1 (타입 + mock 분리)
  Team C: Phase 3 선작업 (정적 페이지 + 공통 UI 컴포넌트)
  Team D: 설계 + Phase 9 로컬 개발 시작
  ── 게이트: CORS curl 확인, shared/types/ export 확인 ──

Wave 2 (Week 2)
  Team A: Phase 5 (BE 도메인 확장 - Community/Post/Product)
  Team B: Phase 2 (API 추상화 + authStore)
  Team C: Phase 3 잔여 + Phase 4 (UI/UX + 인터랙션, mock 기반)
  Team D: Phase 9 계속 (채팅 분석 파이프라인)
  ── 게이트: BE API curl 통과, FE mock API 전체 동작 ──

Wave 3 (Week 3)
  Team A: Phase 6 BE 보완
  Team B: Phase 6 FE 연동 (mock → 실제)
  Team C: Phase 6 UX 검증 + 로딩/에러 실전 적용
  Team D: Phase 8 (Nginx + docker-compose) + Phase 9 계속
  ── 게이트: docker-compose up 후 E2E 플로우 동작 ──

Wave 4 (Week 4)
  Team A: Phase 7 BE (Admin API)
  Team B: Phase 7 FE (Admin 연동 + 라우트 가드)
  Team C: Phase 7 폴리싱 (SEO, 성능, 접근성)
  Team D: Phase 9 프론트 연동 (분석 → admin 차트)
```

### 팀 간 계약(Contract) 포인트

1. **Team A ↔ Team B** (Wave 1 종료): `ApiResponse<T>` 구조, `PageResponse`, 에러 코드 enum
2. **Team B ↔ Team C** (Wave 1 종료): `shared/types/` 인터페이스 확정 (Post, Community, Product, User)
3. **Team A ↔ Team D** (Wave 3 시작 전): Nginx 라우팅 경로 (`/api/v1/` → backend, `/analyze/` → analysis)
4. **Team C ↔ Team D** (Wave 4): admin 분석 페이지 데이터 포맷 (히트맵, 키워드, highlights JSON 스키마)

---

## MCP 서버 설정

프로젝트 루트 `.mcp.json`에 Claude Code용 MCP 서버가 구성되어 있습니다.

| 서버 | 패키지 | 용도 |
|---|---|---|
| `redis` | `@modelcontextprotocol/server-redis` | Redis 캐시 조회/관리 |
| `postgres` | `@modelcontextprotocol/server-postgres` | PostgreSQL 쿼리 (분석용) |
| `docker` | `mcp-server-docker` | 컨테이너 상태 확인 및 관리 |
| `mysql` | `@benborla29/mcp-server-mysql` | MySQL(운영 DB) 스키마·데이터 조회 |

**MySQL 연결 정보** (`MYSQL_HOST=127.0.0.1`, `MYSQL_PORT=3306`, `MYSQL_DB=analysis_trend`) — docker-compose MySQL과 동일.
DELETE 작업은 비활성화(`ALLOW_DELETE_OPERATION=false`)되어 있으며, INSERT/UPDATE는 허용.

Claude Code 재시작 시 자동 활성화됩니다.
