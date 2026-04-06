# frontend/CLAUDE.md

프론트엔드(Next.js 16) 전용 가이드. 루트 `CLAUDE.md`와 함께 참고.

## 명령어

```bash
npm run dev      # 개발 서버 :3000
npm run lint     # ESLint 실행
npm test         # Jest 단위 테스트 (src/__tests__/)
npx tsc --noEmit # 타입 검사 — build 대신 사용 (Turbopack 한글 경로 버그)
# npm run build는 로컬에서 사용 금지. Docker 내부에서만 정상 빌드 가능.
```

## FSD (Feature-Sliced Design) 아키텍처

```
src/
├── shared/
│   ├── api/       — fetch wrapper (client.ts), 엔드포인트 상수 (endpoints.ts)
│   ├── types/     — 도메인 타입 (Post, Comment, User, Community, Product, Schedule, Video, Magazine)
│   ├── mocks/     — magazines, mypage만 유지 (나머지는 실제 API 전환 후 삭제 완료)
│   ├── model/     — Zustand 스토어 (아래 섹션 참고)
│   └── ui/        — Button, Skeleton, Spinner, Toast, ErrorMessage
├── entities/      — 도메인 모델·UI (post/ui/PostCard, post/api/postApi.ts 등)
├── features/      — 사용자 기능 (auth/LoginModal, post/CreatePostModal, search/, community/)
├── widgets/       — 조합형 레이아웃 (Header, Footer, Sidebar)
└── app/           — Next.js App Router 페이지·레이아웃
```

### API 클라이언트 (`shared/api/client.ts`)

- 백엔드 함수: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`
- 분석 서비스 함수: `analysisGet`, `analysisPostForm` (multipart)
- 환경변수: `NEXT_PUBLIC_API_URL`(백엔드), `NEXT_PUBLIC_ANALYSIS_URL`(분석 서비스)
- 에러 처리: 네트워크 에러·5xx → `toastStore` 전역 Toast 자동 표시. 401 → refresh token 재발급 (Toast 없음)
- mock/실제 API 전환 플래그(`NEXT_PUBLIC_USE_MOCK`) 완전 제거됨 (2026-03-27) — 모든 호출이 실제 백엔드로 직결

## Zustand 스토어 (`shared/model/`)

| 스토어 | persist | 주요 기능 |
|---|---|---|
| `authStore` | sessionStorage (`auth-storage`) | login/logout/checkAuth, fetchMe, updateNickname. 탭/브라우저 닫으면 자동 로그아웃. |
| `communityStore` | localStorage (`community-storage`) | posts, joinedCommunities, memberCounts, dailyVisitorLog, weeklyVisitorLog, votedPosts |
| `cartStore` | localStorage | addItem, removeItem, updateQuantity |
| `toastStore` | 없음 | addToast, 자동 dismiss |
| `themeStore` | localStorage | toggle — `classList.toggle('dark')` 방식 (className 직접 할당 금지) |
| `adsStore` | localStorage (`ads-storage`) | 광고 전역 스토어. admin/ads/page.tsx와 공유. |
| `shopQnaStore` | localStorage | Q&A. 초기값 샘플 5건. merge 전략으로 빈 배열 시 복원. |
| `shopReviewStore` | localStorage | 리뷰. 초기값 샘플 7건. merge 전략 동일. |
| `magazineStore` | localStorage (`magazine-storage`) | 매거진 목록. `upsert(article)` / `remove(id)` / `getMagazine(id)`. 초기값 MOCK_MAGAZINES. merge 전략으로 빈 배열 시 초기값 복원. 관리자 저장 내용이 `/magazine` 및 `/magazine/[id]` 에 즉시 반영됨. |
| `modalStore` | 없음 | 전역 모달 제어. 루트 layout의 ModalProvider가 렌더링. |

### authStore 세션 인증 패턴

```ts
// persist storage = sessionStorage
createJSONStorage(() => sessionStorage)
// 수동 setItem/removeItem도 sessionStorage로 통일
// 로그인 성공 시 LoginModal 내부 1.5초 성공 오버레이 표시 후 자동 닫힘
```

### communityStore 주요 패턴

- `isMember(slug)` — `joinedCommunities.includes(slug)` 비교
- `votePostWithApi(postId, type)` — 낙관적 업데이트 + 실패 시 롤백
- `addComment` — `parentId` 있으면 `{ content, parentCommentId }` 함께 전송 (답글 스레딩)
- `recordVisit(name)` — 일별(`YYYY-MM-DD`) + 주별(월요일 기준) 방문자 집계

## 관리자 페이지 (`app/admin/`)

`admin/layout.tsx`에서 `useAuthStore`로 비인증/비관리자 → `return <div aria-hidden />` + `router.replace('/')`. `return null` 금지 (컴포넌트 마운트 차단으로 router.replace 실행 안 됨).

`_hasHydrated` 2초 fallback: Zustand persist hydration 지연 시 무한 스피너 방지.

### 메뉴 구조

- **콘텐츠**: `banner/` (CRUD + 활성 토글), `schedule/` (CRUD), `youtube/` (CRUD), `magazine/` (블록 에디터 CRUD — 기본정보 탭 + 콘텐츠 편집 탭, `ContentBlock[]` 지원)
- **분석 도구**: `analysis/` (채널분석·Persona C), `trends/` (뉴스·YouTube 트렌딩), `chat/` (채팅 파일 분석)
- **운영**: `ads/`, `community/members` (실제 API), `community/posts`, `community/create`, `community/moderators`
- **쇼핑몰**: `shop/products/` (CRUD + 품절 토글 + 다중 이미지), `shop/qna/`, `shop/reviews/`

## 트렌드 페이지 (`app/admin/trends/_content.tsx`)

- `videoDateFilter` (YouTube) / `newsDateFilter` (뉴스원문) 두 상태 분리
- `withinFilter(dateStr, filter)` — RFC 2822·ISO 8601 모두 `new Date()` 직접 파싱, `diffDays <= 1/7/31`
- 뉴스 키워드(`TrendKeyword`)는 날짜 필드 없음 → 필터 버튼 없이 "30분 주기 자동 갱신" 뱃지만 표시
- YouTube·뉴스원문만 일일/일주일/한달 버튼 동작
- 제거된 UI: AI 콘텐츠 인사이트 카드(하단 그라디언트), 페르소나 가이드 배너(3카드)

## 글 상세 페이지 Reddit 스타일 (`community/board/[slug]/comments/[postId]/page.tsx`)

- 포스트 카드: 좌측 투표 컬럼(up=주황, down=파랑), 태그 뱃지, 액션바
- 댓글 권한 3단계: 비로그인 → LoginModal, 비멤버 → joinCommunity 버튼, 멤버 → textarea
- `FIXED_CATEGORIES = ['경제', '방송', '쇼핑', '자유게시판']` — 항상 댓글 허용
- `buildTree(flat)` — `GET /api/v1/posts/{id}/comments` 응답을 트리 구조로 변환
- `CommentItem` 재귀 컴포넌트: 스레드 라인 클릭으로 접기/펼치기, 답글 인라인 textarea
- 낙관적 업데이트 후 `loadComments()` 서버 재동기화
- 우측 사이드바: 그라디언트 배너, 멤버수, 가입버튼, 커뮤니티 규칙

## 채팅 분석 UI (`app/admin/chat/_content.tsx`)

- 히트맵: "1분 동안 채팅 수" 막대 그래프. 색상: 파랑(0~20%) → 초록 → 노랑 → 주황 → 빨강(80~100%)
- 정규화: 방송 내 최대 분당 채팅 수 기준 상대 비교
- Tooltip: CSS group-hover 금지 (overflow clip 문제) → `useState` + `position: fixed` + `z-[9999]` 패턴
- "분석 범위": 마지막~첫 timestamp 차이 → `N시간 N분` 형식
- 피크 구간 종료 시간: `toHMSEnd()` — `"HH:MM"` → `"HH:MM:59"`
- 키워드 탭: 자동 추출 섹션 제거, 검색 키워드 타임라인만 표시
- 편집 마커: 검색 키워드 있으면 키워드 기반(`keyword, timestamp, count`), 없으면 피크 기반

## 주요 패턴·주의사항

- **다크모드**: `globals.css`에 `@variant dark (&:is(.dark *))` 선언 필수. `classList.toggle('dark')` 방식 (className 직접 할당 금지)
- **SEO**: `"use client"` 페이지는 `metadata` export 불가 → `layout.tsx` 별도 생성 후 Metadata 적용
- **매거진 블록 에디터**: `ContentBlock = { type: 'text', value } | { type: 'image', url }`. 텍스트·이미지 자유 혼합. 관리자에서 `magazineStore.upsert()` 저장 → localStorage → `/magazine` 목록, `/magazine/[id]` 상세에 즉시 반영
- **`_content.tsx` 패턴**: 서버 컴포넌트(`generateStaticParams`/`generateMetadata`)가 필요한 페이지에서 클라이언트 스토어를 읽어야 할 때 사용. `page.tsx`(서버) → `_content.tsx`(클라이언트) props로 fallback 전달. `magazine/[id]/` 에서 사용
- **Next.js Image**: 외부 도메인은 `next.config.ts`의 `images.remotePatterns`에 추가 (`images.unsplash.com`, `img.youtube.com` 허용)
- **OAuth2 소셜 로그인 URL**: `window.location.origin + /oauth2/authorization/{provider}`. `NEXT_PUBLIC_API_URL` 기반이면 포트 불일치 오류 발생
- **Google GSI Script 제거**: `Header.tsx`에서 제거됨. GSI 스크립트가 Google 계정 로그인 시 "E" 버튼을 헤더에 자동 주입했음. OAuth2는 `LoginModal.tsx`의 `<a href>` 링크 방식으로 처리
- **Header 장바구니**: `usePathname().startsWith('/shop') && isAuthenticated` 조건부 렌더링
- **로그아웃 확인 모달**: `logoutConfirmOpen` state로 확인 모달 거쳐 실행 (데스크탑 + 모바일 드로어 동일)
- **로그인/로그아웃 Toast**: 로그인 성공 → `toastSuccess('로그인 되었습니다.')`, 로그아웃 → `toastSuccess('로그아웃 되었습니다.')`
- **YouTube videoId 파싱**: `extractYoutubeId()` → `new URL()` 파싱 → `?v=` 추출 → 11자리 `/^[a-zA-Z0-9_-]{11}$/` 검증. 실패 시 null + 에러 토스트
- **유튜브 썸네일**: `https://img.youtube.com/vi/{video_id}/mqdefault.jpg`
- **메인 배너**: 마운트 시 `GET /api/v1/banners` → `active=true` + `displayOrder` 순 슬라이더. API 실패 시 하드코딩 fallback
- **광고 플로팅**: `adsVisible` state + `localStorage('ads-sidebar-dismissed')` persist. 오른쪽 하단 fixed 패널
- **광고 활성 필터**: `ads.filter(a => a.active !== false)`로 활성 광고만 홈화면 표시
- **방송일정 월 네비게이션**: `viewYear`, `viewMonth` state → API에 year/month 파라미터 전달
- **커뮤니티 게시물 필터**: `post.community === decodeURIComponent(slug)` 매칭. 없으면 mock fallback
- **FIXED_CATEGORIES**: `['경제', '방송', '쇼핑', '자유게시판']` — Sidebar 토픽 섹션에만 표시. 커뮤니티 섹션·recentCommunities·가입 버튼에서 제외
- **커뮤니티 사이드바**: `joinedCommunities`에 포함된 커뮤니티만 표시. `getMemberCount` 내림차순 정렬
- **커뮤니티 권한 시스템**: 프론트엔드 UI 완료(`admin/community/create/`, `admin/community/moderators/`). 백엔드 API 연동은 Phase 2 과제
- **PostCard 투표**: `votePostWithApi` 사용. `getVoteState(id)` → upvote 활성=주황, downvote 활성=파랑
- **tsconfig**: `src/__tests__/`, `jest.config.ts` 제외 처리 (Jest 타입과 충돌 방지)
- **관리자 UI 색상 통일**: h2/h3에 `text-gray-900 dark:text-white` 일괄 적용. 삭제 버튼: `bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg`
- **상품 다중 이미지**: `Product.thumbnailImages` = TEXT 컬럼에 JSON 배열(`string[]`) 저장. 관리자 기본정보 탭: 슬라이더 섬네일 여러 장 추가/삭제/순서변경. 상세페이지 탭: 일괄 추가 textarea(줄바꿈 구분). 상품 상세 페이지(`shop/[id]`): `parseThumbnails(product)` → imageUrl + thumbnailImages 병합 → 슬라이더 + 하단 썸네일 스트립 표시
- **Sidebar**: 마운트 시 `GET /api/v1/communities` 실제 API 호출. 실패 시 빈 배열 (mock fallback 제거 완료)
- **커뮤니티 상세 사이드바**: 멤버수·일간 방문자·주간 방문자 3열 표시. 마운트 시 `recordVisit(slug)` 자동 호출
- **로그인 모달 텍스트**: `LoginModal.tsx` input에 `text-gray-900 dark:text-white` 적용 (라이트 모드 회색 문제 해결)
- **홈 커뮤니티 인기글 링크**: `<Link href={/community/board/${encodeURIComponent(category)}}>` 래핑

## Jest 단위 테스트

`src/__tests__/` — 5개 스토어: authStore, communityStore, cartStore, toastStore, themeStore
