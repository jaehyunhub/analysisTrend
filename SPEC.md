# analysisTrend 점진적 개선 계획

> 기준: PRD.md v1.0 | 아키텍처 분석: 2026-03-15 | 전략: DDD-lite + 레이어드 아키텍처 + Nginx MSA

## Context

analysisTrend는 Docker Compose 기반 트렌드 분석 플랫폼으로, 프론트엔드(Next.js 16), 백엔드(Spring Boot 3.5), 분석 서비스(FastAPI)로 구성됩니다.

**현재 상태:** 프론트엔드 UI는 대부분 구현 완료(홈, 커뮤니티, 쇼핑, 마이페이지, 관리자 전체)되었으나, 모든 데이터가 컴포넌트 내부에 하드코딩되어 있고, API 추상화 레이어가 없으며, 인터랙션(투표, 장바구니, 검색 등)이 동작하지 않습니다. 백엔드는 OAuth2+JWT 인증만 구현되어 있고, 비즈니스 도메인(커뮤니티, 상품 등)은 미구현입니다.

**목표:** Phase 0(기반 수정)부터 시작해 8단계에 걸쳐 버그 제거 → 타입/API 추상화 → UI/UX → 인터랙션 → 백엔드 확장 → 연동 → 관리자/폴리싱 → 분석 서비스 순으로 점진적 개선합니다.

**완성도**: ~15% (인증 완료, UI 셸 존재, 하드코딩 데이터)

---

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

## - [ ] Phase 0: 기반 수정 (블로커 제거) ★ 모든 Phase의 전제

### 오버뷰
이후 모든 작업의 전제가 되는 치명적 버그·보안 문제를 해결합니다. 이 Phase 없이는 프론트-백엔드 통신 자체가 불가능합니다.

### 주요 파일 참조
- `backend/src/main/java/backend/global/baseEntity/BaseTimeEntity.java` — `@LastModifiedBy` 버그
- `backend/src/main/java/backend/global/config/SecurityConfig.java` — CORS 비활성화
- `backend/src/main/resources/application.yml` — OAuth 시크릿 평문 노출
- `backend/build.gradle` — 의존성

### 작업 목록

- [ ] **BaseTimeEntity 버그 수정** — `@LastModifiedBy` → `@LastModifiedDate` (현재 updatedAt이 null)
- [ ] **JpaAuditingConfig 분리** — `global/config/JpaAuditingConfig.java` 신규 생성 (`@EnableJpaAuditing`)
- [ ] **시크릿 환경변수화**
  - [ ] `application.yml`의 OAuth 시크릿 → `${GOOGLE_CLIENT_SECRET}` 플레이스홀더
  - [ ] `backend/.env` 신규 생성 (gitignore)
  - [ ] `.env.example` 신규 생성 (공개용)
- [ ] **CORS 활성화** — SecurityConfig 주석 해제, `WebMvcConfig.java` 신규 생성
  - [ ] 허용 origin: `http://localhost:3000`
  - [ ] 허용 메서드: GET, POST, PUT, DELETE, OPTIONS
- [ ] **GlobalExceptionHandler + 표준 응답 구조**
  - [ ] `global/exception/GlobalExceptionHandler.java` — `@RestControllerAdvice`
  - [ ] `global/exception/ErrorCode.java` — enum (POST_NOT_FOUND, DUPLICATE_VOTE 등)
  - [ ] `global/exception/ErrorResponse.java`
  - [ ] `global/exception/BusinessException.java`, `EntityNotFoundException.java`
  - [ ] `global/common/ApiResponse.java` — `{ success, data, message, timestamp }`
  - [ ] `global/common/PageResponse.java`
- [ ] **Bean Validation 의존성 추가** — `build.gradle`
  - [ ] `implementation 'org.springframework.boot:spring-boot-starter-validation'`
  - [ ] `implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'`
  - [ ] 제거: `implementation 'org.springframework.boot:spring-boot-starter-batch'` (미사용)
  - [ ] 기존 DTO에 `@NotBlank`, `@Email`, `@Size` 어노테이션 추가
- [ ] **.gitignore 보강** — `.env`, `*.env`, `application-secrets.yml` 추가

### 검증 항목

- [ ] `./gradlew test` 통과
- [ ] `updatedAt` 필드 정상 저장 확인 (null 아님)
- [ ] `curl -H "Origin: http://localhost:3000" http://localhost:8080/api/v1/auth/signup` — CORS 헤더 포함 응답
- [ ] `.env` 파일이 `git status`에 미포함
- [ ] Swagger UI (`/swagger-ui.html`) 접속 성공

---

## - [ ] Phase 1: Mock 데이터 체계화 및 TypeScript 타입 시스템 구축

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

- [ ] `frontend/src/shared/types/` 디렉토리 생성 및 도메인 타입 정의
  - [ ] `post.ts` — Post, Comment, Vote 인터페이스
  - [ ] `user.ts` — User, AuthState 인터페이스
  - [ ] `community.ts` — Community, CommunityMember 인터페이스
  - [ ] `shop.ts` — Product, Order, CartItem 인터페이스
  - [ ] `schedule.ts` — Schedule, BroadcastNews 인터페이스
  - [ ] `video.ts` — Video 인터페이스
  - [ ] `index.ts` — 전체 re-export
- [ ] `frontend/src/shared/mocks/` 디렉토리 생성 및 데이터 분리
  - [ ] `posts.ts` — 커뮤니티 게시글 (community/page.tsx에서 추출)
  - [ ] `communities.ts` — 커뮤니티 목록
  - [ ] `products.ts` — 상품 (shop/page.tsx에서 추출)
  - [ ] `videos.ts` — YouTube 비디오 (page.tsx에서 추출)
  - [ ] `schedules.ts` — 스케줄/뉴스 (page.tsx에서 추출)
  - [ ] `users.ts` — 사용자 데이터
  - [ ] `index.ts` — 전체 re-export
- [ ] 기존 페이지에서 하드코딩 데이터를 mock import로 교체
  - [ ] `app/page.tsx` — SCHEDULE_DAYS, BOARD_ITEMS, RECENT_VIDEOS, POPULAR_POSTS, SHOP_ITEMS
  - [ ] `app/community/page.tsx` — posts, POPULAR_COMMUNITIES
  - [ ] `app/shop/page.tsx` — PRODUCTS, CATEGORIES
  - [ ] `app/mypage/page.tsx` — 주문/활동 데이터
  - [ ] 관리자 페이지들 — 배너, 스케줄, 광고, YouTube, 멤버 데이터
- [ ] PostCard Props를 `shared/types/post.ts`의 Post 타입으로 통일
- [ ] 영어 mock 데이터를 한국어로 번역

### 검증 항목

- [ ] `npm run build` 성공 (타입 에러 없음)
- [ ] 모든 페이지 정상 렌더링 확인 (`/`, `/community`, `/shop`, `/mypage`, `/admin/*`)
- [ ] 페이지 컴포넌트에 하드코딩된 데이터가 없고, 모두 `shared/mocks/`에서 import
- [ ] 모든 컴포넌트가 `shared/types/`의 타입을 참조
- [ ] `npm run lint` 에러 없음

---

## - [ ] Phase 2: API 추상화 레이어 및 인증 상태 관리

### 오버뷰
실제 백엔드 연동을 위한 API 클라이언트 추상화 레이어를 구축합니다. `LoginModal`에서 직접 fetch하는 방식을 Zustand 기반 인증 스토어로 교체하고, mock/실제 API를 플래그 하나로 전환할 수 있는 구조를 만듭니다.

### 주요 파일 참조
- `frontend/src/features/auth/ui/LoginModal.tsx` — 현재 유일한 API 통신 코드 (fetch 직접 호출)
- `frontend/src/shared/model/modalStore.ts` — Zustand 스토어 패턴 참조
- `frontend/src/widgets/Header/Header.tsx` — 인증 상태에 따른 UI 변경 필요
- `frontend/src/app/ModalProvider.tsx` — 모달 중앙 관리

### 작업 목록

- [ ] `frontend/src/shared/api/` 디렉토리 생성
  - [ ] `client.ts` — fetch wrapper (baseURL, 헤더, 토큰 자동 주입, 에러 핸들링)
  - [ ] `endpoints.ts` — API 엔드포인트 상수 (`/api/v1/auth/login` 등)
  - [ ] `index.ts` — re-export
- [ ] `frontend/src/shared/api/mock/` 디렉토리 생성
  - [ ] `mockApi.ts` — mock 데이터를 Promise로 반환하는 함수들
  - [ ] `delay.ts` — 네트워크 지연 시뮬레이션 유틸리티
  - [ ] `config.ts` — `USE_MOCK_API = true` 플래그
- [ ] `frontend/src/shared/model/authStore.ts` — Zustand 인증 스토어
  - [ ] 상태: user, accessToken, isAuthenticated, isLoading
  - [ ] 액션: login, logout, signup, checkAuth
  - [ ] localStorage persist
- [ ] Header 컴포넌트 인증 상태 반영
  - [ ] 로그인 시: 사용자 닉네임/아바타 + 로그아웃 버튼
  - [ ] 비로그인 시: 기존 Log In 버튼
- [ ] LoginModal을 authStore 사용으로 리팩토링 (직접 fetch 제거)
- [ ] 커뮤니티/상품 도메인 API 서비스 함수 정의
  - [ ] `entities/post/api/postApi.ts` — getPosts, getPostById, createPost, votePost
  - [ ] `entities/product/api/productApi.ts` — getProducts, getProductById
- [ ] 로그인 모달 열기를 Zustand 모달 스토어에서 통합 관리

### 검증 항목

- [ ] 로그인/회원가입이 mock API로 정상 동작
- [ ] 로그인 후 Header에 사용자 정보 표시, 로그아웃 시 로그인 버튼 복귀
- [ ] 페이지 새로고침 시 인증 상태 유지 (localStorage persist)
- [ ] `USE_MOCK_API` 플래그 전환 시 mock/실제 API 정상 전환
- [ ] `npm run build` 성공

---

## - [~] Phase 3: 프론트엔드 UI/UX 개선 및 누락 페이지 구현 ← 일부 완료

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

- [ ] Magazine 페이지 구현
  - [ ] `app/magazine/page.tsx` — 매거진 카드 그리드, 카테고리 필터
  - [ ] `app/magazine/[id]/page.tsx` — 매거진 상세
  - [ ] `shared/mocks/magazines.ts` — mock 데이터
  - [ ] `shared/types/magazine.ts` — Magazine 타입
- [ ] About 페이지 구현
  - [ ] `app/about/page.tsx` — 서비스 소개, 정적 콘텐츠
- [ ] 로딩 상태 UI 컴포넌트 — `shared/ui/`
  - [ ] `Skeleton.tsx` — 스켈레톤 로더 (카드, 텍스트, 이미지 변형)
  - [ ] `Spinner.tsx` — 스피너
- [ ] 에러 상태 UI
  - [ ] `app/not-found.tsx` — 404 페이지
  - [ ] `app/error.tsx` — 전역 에러 바운더리
  - [ ] `shared/ui/ErrorMessage.tsx` — 인라인 에러 메시지
- [ ] 다크모드 토글 구현
  - [ ] `shared/model/themeStore.ts` — Zustand 테마 스토어
  - [ ] Header에 토글 버튼 추가
  - [ ] `html` 태그에 class="dark" 동적 적용
- [ ] 모바일 반응형 네비게이션 — Header에 햄버거 메뉴 추가
- [ ] Header 네비게이션 링크의 `href="#"`을 실제 경로(`/magazine`, `/about`)로 변경
- [ ] `layout.tsx` metadata 수정 (title: "AnalysisTrend - 트렌드 분석 플랫폼")

### 검증 항목

- [ ] `/magazine` 페이지 정상 렌더링, 카테고리 필터 동작
- [ ] `/about` 페이지 정상 렌더링
- [ ] 존재하지 않는 URL 접속 시 404 페이지 표시
- [ ] 다크모드 토글 동작 (라이트↔다크 전환)
- [ ] 모바일(375px)에서 햄버거 메뉴 동작
- [ ] 스켈레톤 로더가 데이터 로딩 중 표시
- [ ] `npm run build` 성공

---

## - [ ] Phase 4: 프론트엔드 인터랙션 강화 및 상태 관리 고도화

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

- [ ] 커뮤니티 Zustand 스토어 — `shared/model/communityStore.ts`
  - [ ] 상태: posts, communities, selectedFilter
  - [ ] 액션: addPost, votePost, addComment, setFilter
- [ ] 커뮤니티 글 작성 동작 연결
  - [ ] CreatePostModal 제출 → communityStore.addPost → 피드에 반영
- [ ] 투표(upvote/downvote) 동작 — PostCard 화살표 클릭 시 숫자 변경
- [ ] 댓글 작성 동작 — PostDetailModal에서 댓글 입력/추가
- [ ] 커뮤니티 필터 동작 — Best/Hot/New/Top 버튼에 정렬 로직 연결
- [ ] 쇼핑 장바구니 스토어 — `shared/model/cartStore.ts`
  - [ ] 상태: items, totalPrice
  - [ ] 액션: addItem, removeItem, updateQuantity
- [ ] 쇼핑 카테고리 필터 동작 — 버튼 클릭 시 상품 필터링
- [ ] 쇼핑 페이지네이션 동작
- [ ] 검색 기능 강화
  - [ ] CommunitySearch 디바운스 적용
  - [ ] `/shop` 페이지에 검색바 추가
- [ ] 마이페이지 인터랙션
  - [ ] 프로필 수정 (닉네임, 자기소개) → authStore에 저장
  - [ ] 주문 필터 탭 동작
- [ ] Toast/Notification 시스템 — `shared/ui/Toast.tsx`
  - [ ] Zustand 스토어: `shared/model/toastStore.ts`
  - [ ] "글이 작성되었습니다", "장바구니에 추가되었습니다" 등 피드백

### 검증 항목

- [ ] 커뮤니티 글 작성 → 피드에 새 글 표시
- [ ] 투표 버튼 클릭 → 숫자 증감
- [ ] 댓글 작성 → 댓글 목록에 추가
- [ ] 장바구니 추가/삭제/수량변경 동작
- [ ] 카테고리 필터 및 검색 동작
- [ ] 필터 정렬 (Best/Hot/New/Top) 동작
- [ ] Toast 알림 표시
- [ ] `npm run build` 성공

---

## - [ ] Phase 5: 백엔드 도메인 확장 (커뮤니티, 게시물, 상품)

### 오버뷰
백엔드에 커뮤니티/게시물/상품 도메인을 구현합니다. CORS를 활성화하고 RESTful API를 제공합니다. 이 단계는 Phase 4와 병렬 진행 가능합니다. 프론트엔드 연동은 Phase 6에서 진행합니다.

### 주요 파일 참조
- `backend/src/main/java/backend/global/config/SecurityConfig.java` — CORS 활성화, API 인가 규칙 수정
- `backend/src/main/java/backend/user/controller/AuthController.java` — 컨트롤러 패턴 참조
- `backend/src/main/java/backend/user/domain/User.java` — 엔티티 패턴 참조
- `backend/src/main/java/backend/global/baseEntity/BaseTimeEntity.java` — JPA 감사 베이스 클래스
- `backend/build.gradle` — 의존성 확인

### 작업 목록

- [ ] CORS 설정 활성화 — SecurityConfig에서 주석 해제 및 설정
  - [ ] 허용 origin: `http://localhost:3000`
  - [ ] 허용 메서드: GET, POST, PUT, DELETE, OPTIONS
- [ ] Community 도메인 — `backend/src/main/java/backend/community/`
  - [ ] `domain/Community.java` — id, name, description, memberCount, createdAt
  - [ ] `repository/CommunityRepository.java`
  - [ ] `service/CommunityService.java` — CRUD
  - [ ] `controller/CommunityController.java` — `/api/v1/communities`
  - [ ] `dto/` — CreateCommunityRequest, CommunityResponse
- [ ] Post 도메인 — `backend/src/main/java/backend/post/`
  - [ ] `domain/Post.java` — id, title, content, author(User), community, upvotes, createdAt
  - [ ] `domain/Comment.java` — id, content, author(User), post, parentComment, createdAt
  - [ ] `domain/Vote.java` — id, user, post, voteType(UP/DOWN)
  - [ ] `repository/` — PostRepository, CommentRepository, VoteRepository
  - [ ] `service/PostService.java` — CRUD, 투표, 정렬(Hot/New/Top)
  - [ ] `controller/PostController.java` — `/api/v1/posts`
  - [ ] `controller/CommentController.java` — `/api/v1/posts/{id}/comments`
- [ ] Product 도메인 — `backend/src/main/java/backend/product/`
  - [ ] `domain/Product.java` — id, name, price, originalPrice, discount, category, isSoldOut
  - [ ] `domain/ProductCategory.java` — enum (GOODS, FOOD, FASHION, DIGITAL)
  - [ ] `repository/ProductRepository.java`
  - [ ] `service/ProductService.java` — 목록 조회, 카테고리 필터
  - [ ] `controller/ProductController.java` — `/api/v1/products`
- [ ] SecurityConfig 업데이트 — 새 API 경로 인가 규칙
  - [ ] GET `/api/v1/communities/**`, `/api/v1/posts/**`, `/api/v1/products/**` → permitAll
  - [ ] POST/PUT/DELETE → authenticated
- [ ] 글로벌 예외 처리 — `global/exception/`
  - [ ] `GlobalExceptionHandler.java` — @ControllerAdvice
  - [ ] `ErrorResponse.java` — 통일된 에러 응답 DTO

### 검증 항목

- [ ] `./gradlew build` 성공
- [ ] `./gradlew test` 전체 통과
- [ ] API 엔드포인트 테스트 (curl)
  - [ ] GET `/api/v1/communities` → 200
  - [ ] POST `/api/v1/posts` (with JWT) → 201
  - [ ] GET `/api/v1/products` → 200
  - [ ] GET `/api/v1/products?category=FOOD` → 필터된 결과
- [ ] CORS 헤더 확인 (`Access-Control-Allow-Origin: http://localhost:3000`)

---

## - [ ] Phase 6: 프론트엔드-백엔드 연동

### 오버뷰
Phase 2의 API 추상화 레이어에서 mock 플래그를 끄고 실제 백엔드 API와 연동합니다. 환경 변수로 mock/실제 API를 전환할 수 있도록 합니다. 토큰 재발급, 에러 핸들링을 통합합니다.

### 주요 파일 참조
- `frontend/src/shared/api/client.ts` — API 클라이언트 (Phase 2에서 생성)
- `frontend/src/shared/api/mock/config.ts` — USE_MOCK_API 플래그
- `frontend/src/shared/model/authStore.ts` — 인증 스토어 (Phase 2에서 생성)
- `frontend/src/shared/model/communityStore.ts` — 커뮤니티 스토어 (Phase 4에서 생성)
- `frontend/src/app/oauth/callback/page.tsx` — OAuth 콜백 처리

### 작업 목록

- [ ] 환경 변수 설정 — `.env.local`
  - [ ] `NEXT_PUBLIC_API_URL=http://localhost:8080`
  - [ ] `NEXT_PUBLIC_USE_MOCK=false`
- [ ] API 클라이언트 실제 연동 — `shared/api/client.ts` 수정
  - [ ] baseURL을 환경 변수에서 가져오기
  - [ ] 401 응답 시 토큰 재발급 자동 시도
  - [ ] 재발급 실패 시 로그아웃 및 로그인 모달 표시
- [ ] 인증 연동
  - [ ] authStore의 login/signup을 실제 API 호출로 변경
  - [ ] OAuth2 콜백 로직 점검 및 authStore 연동
  - [ ] Refresh token 갱신 로직
- [ ] 커뮤니티 연동
  - [ ] communityStore 데이터 소스를 API로 전환
  - [ ] 글 작성/수정/삭제 API 호출
  - [ ] 투표/댓글 API 호출
- [ ] 상품 연동 — productApi mock을 실제 API로 전환
- [ ] Sidebar 커뮤니티 목록 API 연동
- [ ] 에러 핸들링 통합 — API 에러 시 Toast 표시, 네트워크 에러 시 재시도

### 검증 항목

- [ ] `docker-compose up -d` 후 전체 서비스 정상 기동
- [ ] 회원가입 → 로그인 → 토큰 저장 → 인증된 요청 플로우 동작
- [ ] OAuth2 로그인 (Google/Kakao/Naver) 플로우 동작
- [ ] 글 작성 → 목록 확인 → 상세 조회 → 댓글 작성 플로우
- [ ] 상품 목록 → 카테고리 필터 → 상세 조회 플로우
- [ ] `NEXT_PUBLIC_USE_MOCK=true` 전환 시 mock 모드 정상 동작
- [ ] `npm run build` 성공

---

## - [ ] Phase 7: 관리자 기능 구현 및 전체 폴리싱

### 오버뷰
관리자 페이지 CRUD를 실제로 동작하도록 구현하고, SEO, 성능 최적화, 접근성 개선 등 전체 폴리싱을 진행합니다. Analysis 서비스에 기초 트렌드 분석 엔드포인트를 추가합니다.

### 주요 파일 참조
- `frontend/src/app/admin/layout.tsx` — 관리자 레이아웃
- `frontend/src/app/admin/banner/page.tsx` — 배너 관리 (UI만 구현)
- `frontend/src/app/admin/schedule/page.tsx` — 스케줄 관리 (UI만 구현)
- `backend/src/main/java/backend/global/config/SecurityConfig.java` — 관리자 권한 체크
- `analysis/main.py` — 분석 서비스 (헬스체크만)

### 작업 목록

- [ ] 관리자 API 구현 (백엔드)
  - [ ] `/api/v1/admin/banner` — 배너 CRUD
  - [ ] `/api/v1/admin/schedule` — 스케줄 CRUD
  - [ ] `/api/v1/admin/youtube` — YouTube 링크 관리
  - [ ] `@PreAuthorize("hasRole('ADMIN')")` 권한 체크
- [ ] 관리자 페이지 기능 연결 (프론트엔드)
  - [ ] `/admin/banner` — 배너 CRUD 폼 + API 연동
  - [ ] `/admin/schedule` — 스케줄 추가/수정/삭제
  - [ ] `/admin/ads` — 광고 슬롯 관리
  - [ ] `/admin/youtube` — YouTube URL 추가/삭제
  - [ ] `/admin/community/members` — 회원 목록 + 권한 변경
  - [ ] `/admin/analysis` — 차트/통계 (mock 차트 데이터)
- [ ] 관리자 라우트 가드 — 비관리자 접근 시 리다이렉트
- [ ] SEO 최적화
  - [ ] 각 페이지별 metadata (title, description, openGraph)
  - [ ] `robots.txt`, `sitemap.xml`
  - [ ] 이미지 alt 텍스트
- [ ] 성능 최적화
  - [ ] Next.js Image 컴포넌트 활용
  - [ ] 관리자 페이지 dynamic import
  - [ ] 리스트 아이템 React.memo
- [ ] 접근성(a11y) 개선
  - [ ] 시맨틱 HTML (nav, main, article, aside)
  - [ ] aria-label (아이콘 버튼, 모달)
  - [ ] 키보드 네비게이션
- [ ] Analysis 서비스 기초 연동 — `analysis/main.py`에 트렌드 분석 엔드포인트 추가 (mock 기반)

### 검증 항목

- [ ] 관리자 로그인 후 배너/스케줄/YouTube CRUD 동작
- [ ] 비관리자로 `/admin` 접속 시 리다이렉트
- [ ] 전체 사이트 키보드 네비게이션 가능
- [ ] `npm run build` 성공
- [ ] `./gradlew build` 성공
- [ ] `docker-compose up -d` 후 전체 서비스 정상 기동

---

## - [ ] Phase 8 (★ Phase 7과 병렬 가능): 인프라 개선

### 오버뷰
Nginx 리버스 프록시를 추가해 단일 진입점(포트 80)을 구성하고, docker-compose를 운영 수준으로 개선합니다. Phase 7 관리자/폴리싱과 병렬 진행 가능합니다.

### 주요 파일 참조
- `docker-compose.yml` — 포트 직접 노출 (3306, 6379, 8080, 8000, 3000 모두 열려있음)
- `backend/Dockerfile`, `frontend/Dockerfile`
- `backend/src/main/resources/application.yml` — 환경 프로필 분리 필요

### 작업 목록

- [ ] **Nginx 리버스 프록시** — `nginx/nginx.conf` 신규 생성
  - [ ] `/` → `frontend:3000`
  - [ ] `/api/`, `/oauth2/`, `/login/` → `backend:8080`
  - [ ] `/analyze/`, `/trends/`, `/analytics/` → `analysis:8000`
  - [ ] `client_max_body_size 50M` (채팅 파일 업로드)
- [ ] **docker-compose.yml 개선**
  - [ ] `nginx` 서비스 추가 (포트 80만 외부 노출)
  - [ ] mysql, redis, backend, analysis, frontend → `expose` (내부 전용)
  - [ ] 각 서비스 `env_file` 참조 추가
  - [ ] MySQL `healthcheck` 추가
  - [ ] backend `depends_on: mysql: condition: service_healthy`
  - [ ] DB URL에 `serverTimezone=Asia/Seoul` 추가
- [ ] **환경 변수 파일 구조 정리**
  - [ ] `backend/.env` (gitignore) — JWT, OAuth 시크릿
  - [ ] `analysis/.env` (gitignore) — Naver API 키, YouTube API 키
  - [ ] `frontend/.env.local` (gitignore)
  - [ ] `.env.example` — 플레이스홀더 포함 공개 템플릿
- [ ] **application.yml 프로필 분리**
  - [ ] `application-dev.yml` — `ddl-auto: update`, 콘솔 로깅
  - [ ] `application-prod.yml` — `ddl-auto: validate`, JSON 로깅

### 검증 항목

- [ ] `docker-compose up -d` 후 `http://localhost` (포트 80) 접속 성공
- [ ] 외부에서 3306, 6379, 8080, 8000, 3000 직접 접근 불가 확인
- [ ] 50MB 이하 파일 Nginx 통과 확인
- [ ] `docker ps` — 모든 컨테이너 healthy 상태

---

## - [ ] Phase 9 (★ Phase 8과 병렬 가능): 분석 서비스 구현

### 오버뷰
FastAPI 분석 서비스에 채팅 분석, 뉴스 키워드 수집, YouTube 급상승 수집을 구현합니다. 이것이 PRD의 핵심 차별화 기능입니다. Phase 8 인프라와 병렬로 로컬 개발 진행 가능합니다.

### 주요 파일 참조
- `analysis/main.py` — 헬스체크만 존재
- `analysis/requirements.txt` — fastapi, uvicorn 2개만
- `analysis/Dockerfile`

### 작업 목록

- [ ] **분석 서비스 모듈화**
  - [ ] `analysis/config.py` — pydantic-settings 환경 변수
  - [ ] `analysis/routers/` — `health.py`, `chat.py`, `trends.py`
  - [ ] `analysis/services/` — `chat_analyzer.py`, `news_collector.py`, `youtube_collector.py`, `cache.py`
  - [ ] `analysis/parsers/` — `base.py`, `csv_parser.py`, `json_parser.py`, `txt_parser.py` (Strategy 패턴)
  - [ ] `analysis/models/` — `chat.py`, `trend.py` (Pydantic 모델)
  - [ ] `analysis/tasks/scheduler.py` — APScheduler

- [ ] **requirements.txt 확장**
  - [ ] `httpx>=0.27.0` — 외부 API 비동기 호출
  - [ ] `redis>=5.0` — 캐시
  - [ ] `apscheduler>=3.10.0` — 30분 주기 스케줄러
  - [ ] `soynlpy>=0.0.493` — 한국어 NLP (konlpy 대신 — JVM 불필요)
  - [ ] `scikit-learn>=1.4.0` — TF-IDF
  - [ ] `numpy>=1.26.0`
  - [ ] `python-multipart>=0.0.9` — 파일 업로드

- [ ] **채팅 분석 파이프라인 (CHAT-01~05, PRD 핵심 차별화)**
  - [ ] `POST /analyze/chat` — 파일 업로드 엔드포인트
  - [ ] CSV/JSON/TXT 파서 (Strategy 패턴)
  - [ ] 30초/1분/5분 버킷 집계
  - [ ] TF-IDF 자동 키워드 추출 (상위 20개)
  - [ ] 피크 감지: 평균 + 2σ 초과 버킷 → `highlights` 반환
  - [ ] 50MB 이상 비동기 처리: `task_id` 반환 → `GET /analyze/chat/{task_id}` 폴링
  - [ ] 결과 Redis 저장 (TTL 1시간)

- [ ] **뉴스 키워드 수집 (TRD-02)**
  - [ ] APScheduler 30분 주기 실행
  - [ ] Naver News API로 최신 뉴스 100개 수집
  - [ ] soynlp 명사 추출 → TF-IDF 상위 30개 키워드
  - [ ] Redis 저장 (Key: `news_keywords`, TTL: 30분)
  - [ ] `GET /trends/keywords` 엔드포인트

- [ ] **YouTube 급상승 수집 (TRD-01)**
  - [ ] YouTube Data API v3 `videos.list?chart=mostPopular`
  - [ ] 파라미터: regionCode, videoCategoryId, maxResults=20
  - [ ] Redis 캐시 (Key: `trending_{regionCode}_{categoryId}`, TTL: 30분)
  - [ ] `GET /trends/youtube?region=KR&category=25` 엔드포인트

- [ ] **프론트엔드 분석/트렌드 페이지 연동**
  - [ ] `admin/analysis/page.tsx` — 채팅 파일 업로드 + Recharts 히트맵 + 편집 마커 CSV 다운로드
  - [ ] `admin/youtube/page.tsx` — YouTube 급상승 (국가·카테고리 필터)
  - [ ] `admin/schedule/page.tsx` — 뉴스 키워드 클라우드

### 검증 항목

- [ ] 샘플 CSV 업로드 → 30초 이내 heatmap, keywords, highlights 응답
- [ ] `GET /trends/keywords` → 30개 키워드 반환
- [ ] `GET /trends/youtube?region=KR` → 20개 영상 반환
- [ ] 편집 마커 CSV 다운로드 성공 (`timestamp, label` 형식)
- [ ] Redis에 `news_keywords` 키 존재 확인
