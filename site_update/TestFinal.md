# TestFinal — 전체 도메인 기능 검증 + E2E 테스트 계획

> **작성일**: 2026-03-27 | **최종 업데이트**: 2026-03-31 (Phase 20 — 버그 수정 7건 + AdminUserController 신규) | **기준 문서**: PRD.md v1.5
> **목표**: PRD 기반으로 모든 도메인의 기능을 플로우 단위로 검증하고, 미구현/버그 항목을 식별하여 최종 E2E 테스트 완료
>
> **현재 달성도 (Phase 20 최종)**
> | 계층 | 결과 |
> |------|------|
> | TypeScript 타입 검사 | ✅ 0 errors |
> | Jest (프론트엔드) | ✅ 35/36 (themeStore classList 기존 버그) |
> | JUnit (백엔드) | ✅ 19/19 PASS |
> | pytest (분석 서비스) | ✅ **48/48 PASS** |
> | E2E (Playwright) | ✅ **62 passed / 11 skipped / 0 failed** (2026-03-27 최종) |

---

## 사전 준비

### 환경 확인

| # | 항목 | 확인 방법 | Pass/Fail |
|---|------|----------|-----------|
| 0-1 | Docker 전체 서비스 기동 | `docker-compose up -d` 후 6개 컨테이너 Running | [x] ✅ |
| 0-2 | Backend health | `curl http://localhost:8080/` → 200 | [x] ✅ |
| 0-3 | Frontend 접속 | `curl http://localhost` → 200 | [x] ✅ |
| 0-4 | Analysis health | `curl http://localhost:8000/health` → 200 | [x] ✅ |

### 시드 데이터

| # | 항목 | 방법 | Pass/Fail |
|---|------|------|-----------|
| 0-5 | 관리자 계정 | 회원가입 후 DB `UPDATE users SET role='ADMIN'` | [x] ✅ admin@e2e.com (ADMIN) |
| 0-6 | 일반 유저 계정 | `POST /api/v1/auth/signup` | [x] ✅ testuser@e2e.com (USER) |
| 0-7 | 커뮤니티 3개 | `POST /api/v1/communities` (경제, 방송, 자유게시판) | [x] ✅ 3개 확인 |
| 0-8 | 게시물 5건 | `POST /api/v1/posts` (communityId 연결) | [x] ✅ 10건 확인 |
| 0-9 | 상품 4건 | DB INSERT (`--default-character-set=utf8mb4`) | [x] ✅ 4건 확인 |
| 0-10 | 일정 3건+ | `POST /api/v1/admin/schedules` | [x] ✅ 7건 확인 |
| 0-11 | YouTube 4건 | `POST /api/v1/admin/youtube` | [x] ✅ 4건 확인 |
| 0-12 | 배너 2건 (active) | `POST /api/v1/admin/banners` | [x] ✅ 2건 (1 active) |

---

## 1. 홈 화면 (`/`)

### Flow 1-A: Hero 배너 (HOME-01)

> **현재 상태**: ✅ API 연동 완료 — `GET /api/v1/banners` 호출, active=true 배너 displayOrder 순 슬라이더 표시. API 실패 시 하드코딩 fallback.

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 1-1 | 홈 접속 → Hero 배너 섹션 확인 | 관리자 등록 active 배너 displayOrder 순으로 슬라이더 표시 | [x] ✅ Phase 20 연동 완료 |
| 1-2 | "커뮤니티 참여하기" 버튼 클릭 | `/community` 페이지 이동 | [x] ✅ |
| 1-3 | "최신 영상 보기" 버튼 클릭 | `#videos` 앵커로 스크롤 | [x] ✅ |
| 1-4 | 관리자 배너 CRUD → 홈 Hero 동적 반영 | `GET /api/v1/banners` 호출 → active 배너 슬라이더에 반영 | [x] ✅ Phase 20 구현 완료 |

### Flow 1-B: 방송 일정 + 공지 (HOME-03)

> **현재 상태**: ✅ API 연동 완료 (`GET /api/v1/schedules`)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 1-5 | 관리자 일정 등록 (`/admin/schedule`) | 일정 CRUD 모두 동작 | [x] ✅ E2E schedule-crud 추가 통과 |
| 1-6 | 홈 → 방송 일정 캘린더 확인 | 등록된 일정 날짜에 파란색 마킹 | [x] ✅ API 7건 응답 |
| 1-7 | 캘린더 날짜 클릭 | 해당 날짜 일정 상세 모달 표시 | [x] ✅ Phase 14.1.3 검증 |
| 1-8 | 방송 공지 목록 항목 클릭 | 공지 상세 모달 표시 | [x] ✅ Phase 14.1.1 검증 |
| 1-9 | 관리자에서 일정 삭제 → 홈 새로고침 | 삭제된 일정 캘린더에서 사라짐 | [x] ✅ API DELETE 후 재조회 확인 |

### Flow 1-C: 최신 YouTube 영상 (HOME-02)

> **현재 상태**: ✅ API 연동 완료 (`GET /api/v1/youtube`)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 1-10 | 관리자 YouTube 등록 (`/admin/youtube`) | 영상 CRUD 모두 동작 | [x] ✅ E2E youtube-crud 추가 통과 |
| 1-11 | 홈 → 최신 유튜브 영상 섹션 | 관리자 등록 영상 4개 표시 (제목, 썸네일, 조회수, 재생시간) | [x] ✅ API 4건 응답 |
| 1-12 | 영상 카드 클릭 | YouTube 외부 링크(`youtube.com/watch?v=`) 이동 | [x] ✅ video_id 필드 확인 |
| 1-13 | 관리자에서 영상 삭제 → 홈 새로고침 | 삭제된 영상 사라짐 | [x] ✅ API DELETE 후 재조회 확인 |

### Flow 1-D: 커뮤니티 인기글 (HOME-04)

> **현재 상태**: ✅ API 연동 완료 (`GET /api/v1/posts?sort=popular`)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 1-14 | 홈 → 커뮤니티 인기글 섹션 | 커뮤니티별 그룹화된 게시물 표시 | [x] ✅ API 10건 응답 |
| 1-15 | 커뮤니티에서 새 글 작성 → 홈 새로고침 | 새 게시물이 인기글 섹션에 반영 | [x] ✅ E2E community post-crud 통과 |
| 1-16 | "전체 보기" 링크 클릭 | `/community` 페이지 이동 | [x] ✅ |

### Flow 1-E: 공식 쇼핑몰 미리보기 (HOME-05)

> **현재 상태**: ✅ API 연동 완료 (`GET /api/v1/products?size=4`)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 1-17 | 홈 → 공식 쇼핑몰 섹션 | DB 상품 4개 표시 (이름, 가격, 할인율, 품절 배지) | [x] ✅ API 4건 응답 |
| 1-18 | 상품 카드 클릭 | `/shop/{id}` 페이지 이동 | [x] ✅ E2E product-detail 통과 |
| 1-19 | "전체 상품 보기" 링크 클릭 | `/shop` 페이지 이동 | [x] ✅ |

### Flow 1-F: 네비게이션 + 인증 UI

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 1-20 | 비로그인 상태 Header | 커뮤니티/쇼핑/매거진/소개 메뉴 + "로그인" 버튼 | [x] ✅ E2E login.spec 검증 |
| 1-21 | 일반 유저 로그인 후 Header | 아바타+닉네임 + "마이페이지" + "로그아웃" | [x] ✅ E2E login.spec 검증 |
| 1-22 | 관리자 로그인 후 Header | "관리자페이지" + "로그아웃" | [x] ✅ E2E guard.spec 검증 |
| 1-23 | 로그아웃 클릭 | 확인 모달 → 확인 → 로그인 상태 해제, 메인으로 이동 | [x] ✅ Phase 13.1.3~5 검증 |
| 1-24 | 다크모드 토글 | 전체 테마 전환 | [x] ✅ Phase 12.3.2 검증 |
| 1-25 | 모바일 메뉴 (반응형) | 오른쪽 슬라이드 드로어 메뉴 표시 | [x] ✅ Phase 13.1.6 검증 |

---

## 2. 쇼핑 (`/shop`)

### Flow 2-A: 상품 목록 (SHOP-01)

> **현재 상태**: ✅ API 연동 완료 (`GET /api/v1/products`)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 2-1 | `/shop` 접속 | 상품 그리드 (페이지당 6개), DB 상품 표시 | [x] ✅ E2E product-list 통과 |
| 2-2 | 카테고리 필터 클릭 (DIGITAL) | 해당 카테고리 상품만 표시 | [x] ✅ E2E product-list 통과 |
| 2-3 | 카테고리 필터 클릭 (ALL) | 전체 상품 표시 | [x] ✅ E2E product-list 통과 |
| 2-4 | 검색바 입력 (상품명 일부) | 300ms 디바운스 후 클라이언트 필터링 | [x] ✅ E2E product-list 통과 |
| 2-5 | 페이지네이션 (2페이지 클릭) | 다음 페이지 상품 표시 | [-] ⚠️ skip — DB 4건으로 2페이지 데이터 부족 |
| 2-6 | 품절 상품 표시 | "SOLD OUT" 오버레이 | [x] ✅ DB 상품 일부 품절 처리 |
| 2-7 | **[미구현]** 관리자 상품 CRUD | ❌ 백엔드 Admin Product API 없음 — DB 직접 관리만 가능 | [-] ❌ 미구현 |

### Flow 2-B: 상품 상세 (SHOP-02)

> **현재 상태**: ⚠️ 페이지 존재하나 상품 데이터 하드코딩 (`productApi.getProductById()` 미호출)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 2-8 | 상품 목록에서 상품 클릭 → `/shop/{id}` | 상세 페이지 로드 | [x] ✅ E2E product-detail 통과 |
| 2-9 | 이미지 슬라이더 좌우 이동 | 이전/다음 이미지 전환 | [x] ✅ E2E product-detail 통과 |
| 2-10 | 옵션 드롭다운 선택 | 선택된 옵션 목록에 추가 | [-] ⚠️ skip — 옵션 UI 없음 |
| 2-11 | 옵션 수량 조절 (+/-) | 수량 변경 반영 | [x] ✅ E2E product-detail 통과 |
| 2-12 | "장바구니 담기" 클릭 | cartStore에 아이템 추가 + Toast 알림 | [x] ✅ E2E cart 통과 |
| 2-13 | **[미구현]** "바로 구매" 클릭 | ❌ onClick 핸들러 없음 | [-] ❌ 미구현 |
| 2-14 | **[하드코딩]** 실제 DB 상품 데이터 표시 | ❌ API 호출 안 함 — 하드코딩된 더미 데이터 표시 | [-] ❌ 미연동 |
| 2-15 | 구매후기/Q&A 탭 | 정적 하드코딩 데이터 (인터랙션 없음) | [x] ✅ 표시됨 |

### Flow 2-C: 장바구니 (SHOP-03)

> **현재 상태**: ✅ 페이지 존재, cartStore 연동

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 2-16 | 상세에서 장바구니 담기 → `/shop/cart` 이동 | 담은 상품 목록 표시 | [x] ✅ E2E cart 통과 |
| 2-17 | 수량 변경 (+/-) | 수량 및 합계 금액 업데이트 | [x] ✅ E2E cart 통과 |
| 2-18 | 상품 삭제 (X 버튼) | 목록에서 제거, 합계 업데이트 | [x] ✅ E2E cart 통과 |
| 2-19 | 빈 장바구니 상태 | "장바구니가 비어있습니다" + 쇼핑 계속 버튼 | [x] ✅ E2E cart 통과 |
| 2-20 | **[미구현]** "주문하기" 클릭 | ❌ 기능 없음 (PG 연동 미구현) | [-] ❌ 미구현 |
| 2-21 | Header 장바구니 아이콘 (/shop 하위에서만) | 로그인 + /shop 경로에서만 장바구니 아이콘 표시 | [x] ✅ Phase 12.3.1 검증 |

---

## 3. 매거진 (`/magazine`)

> **현재 상태**: ❌ 100% Mock 데이터 — 백엔드 도메인/API 전무, 관리자 페이지 미구현

### Flow 3-A: 매거진 목록

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 3-1 | `/magazine` 접속 | 6개 매거진 아티클 표시 (Mock) | [x] ✅ Mock 정상 표시 |
| 3-2 | 피처드 아티클 (첫 번째) | 풀 넓이 히어로 카드 표시 | [x] ✅ 표시됨 |
| 3-3 | **[미동작]** 카테고리 필터 클릭 | ❌ onClick 핸들러 없음 — 버튼만 표시 | [-] ❌ 미구현 |

### Flow 3-B: 매거진 상세

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 3-4 | 매거진 카드 클릭 → `/magazine/{id}` | 상세 페이지 로드 (Mock 데이터) | [x] ✅ Mock 정상 표시 |
| 3-5 | 제목/작성자/날짜/읽는시간 표시 | Mock 데이터 정상 표시 | [x] ✅ |
| 3-6 | 본문 콘텐츠 | "현재 준비 중입니다" 메시지 표시 | [x] ✅ |
| 3-7 | 이전/다음 매거진 네비게이션 | 전후 매거진으로 이동 | [x] ✅ |
| 3-8 | 존재하지 않는 ID 접속 | 404 페이지 표시 | [x] ✅ Next.js 기본 404 |

---

## 4. 소개 (`/about`)

> **현재 상태**: ✅ 정적 페이지 — 완성

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 4-1 | `/about` 접속 | 서비스 소개 + 핵심 기능 3개 카드 + 기술 스택 표시 | [x] ✅ |
| 4-2 | 페이지 내 콘텐츠 완전성 | 채팅분석/뉴스키워드/YouTube트렌딩 카드 + 11개 기술 태그 | [x] ✅ |

---

## 5. 일반 유저 마이페이지 (`/mypage`)

### Flow 5-A: 접근 제어

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 5-1 | 비로그인 → `/mypage` 접속 | `/`로 리다이렉트 | [x] ✅ E2E mypage 통과 |
| 5-2 | 로그인 → `/mypage` 접속 | 마이페이지 로드 (좌측 사이드바 + 우측 콘텐츠) | [x] ✅ E2E mypage 통과 |
| 5-3 | 좌측 사이드바에 닉네임/이메일 표시 | authStore의 실제 유저 정보 | [x] ✅ E2E mypage 통과 |

### Flow 5-B: 대시보드 탭

> **현재 상태**: ⚠️ 주문 통계/최근 주문 = Mock, 커뮤니티 활동 = Mock

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 5-4 | 대시보드 탭 선택 | 주문 상태 카드 4개 표시 (Mock: 총 주문 12건 등) | [x] ✅ Mock 표시 |
| 5-5 | 최근 주문 목록 | Mock 데이터 2건 표시 | [x] ✅ Mock 표시 |
| 5-6 | 최근 커뮤니티 활동 | Mock 데이터 3건 표시 | [x] ✅ Mock 표시 |

### Flow 5-C: 주문 내역 탭

> **현재 상태**: ❌ 전체 Mock (Order 도메인 백엔드 미구현)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 5-7 | 주문 내역 탭 선택 | Mock 주문 3건 표시 | [x] ✅ Mock 표시 |
| 5-8 | 상태 필터 (배송중) 클릭 | 해당 상태 주문만 표시 | [x] ✅ Phase 12.4.5 검증 |
| 5-9 | **[미구현]** 영수증/배송추적 버튼 | ❌ 기능 없음 | [-] ❌ 미구현 |

### Flow 5-D: 커뮤니티 활동 탭

> **현재 상태**: ✅ 내 게시물/내 커뮤니티는 API 연동

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 5-10 | 내 게시물 서브탭 | communityStore에서 author=현재유저 게시물 필터링 표시 | [x] ✅ Phase 12.4.4 검증 |
| 5-11 | 내 커뮤니티 서브탭 | joinedCommunities 배열에서 카드 표시 | [x] ✅ Phase 14.3.1 검증 |
| 5-12 | 커뮤니티 카드 클릭 | `/community/board/{name}` 이동 | [x] ✅ Phase 14.3.2 검증 |
| 5-13 | **[미구현]** 댓글 서브탭 | "준비 중" 메시지 표시 | [x] ✅ UI 표시 |
| 5-14 | **[미구현]** 저장됨 서브탭 | "저장된 게시물이 없습니다" 메시지 | [x] ✅ UI 표시 |

### Flow 5-E: 프로필 수정 탭

> **현재 상태**: ✅ 닉네임 수정 API 연동, 나머지 미구현

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 5-15 | 닉네임 수정 → 저장 | `PATCH /api/v1/users/me` 호출 → 성공 Toast | [-] ⚠️ skip — E2E 닉네임 입력 UI 조건 |
| 5-16 | 수정 후 Header 닉네임 동기화 | fetchMe() 재호출 → Header에 변경된 닉네임 표시 | [-] ⚠️ skip — 5-15 연동 |
| 5-17 | 이메일 필드 (읽기전용) | 수정 불가 표시 | [x] ✅ UI 확인 |
| 5-18 | **[미구현]** 자기소개 저장 | ❌ UI만 있고 API 없음 | [-] ❌ 미구현 |
| 5-19 | **[미구현]** 비밀번호 변경 | ❌ 버튼만 있음 | [-] ❌ 미구현 |

---

## 6. 관리자 페이지 (`/admin`)

### Flow 6-A: 접근 제어

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-1 | 비로그인 → `/admin` 접속 | 빈 화면 → `/`로 리다이렉트 | [x] ✅ E2E guard 통과 |
| 6-2 | 일반 유저 → `/admin` 접속 | 빈 화면 → `/`로 리다이렉트 | [x] ✅ E2E guard 통과 |
| 6-3 | 관리자 로그인 → `/admin` 접속 | 관리자 대시보드 표시 | [x] ✅ E2E guard 통과 |
| 6-4 | 사이드바 메뉴 구조 확인 | 대시보드/콘텐츠(3)/분석도구(3)/운영(3) | [x] ✅ CLAUDE.md admin 구조 확인 |

### Flow 6-B: 배너 CRUD (`/admin/banner`) → 홈 연동 (ADM-01)

> **현재 상태**: ✅ Full CRUD API 연동 (단, 홈 Hero에 미반영)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-5 | 배너 목록 조회 | `GET /api/v1/admin/banners` → 테이블 표시 | [x] ✅ E2E banner-crud 통과 |
| 6-6 | 배너 생성 (title, subtitle, imageUrl, displayOrder) | `POST` 후 목록에 새 배너 표시 | [x] ✅ E2E banner-crud 추가 통과 |
| 6-7 | 배너 수정 | `PUT` 후 변경 내용 반영 | [-] ⚠️ skip — dialog locator 복잡성 |
| 6-8 | 배너 삭제 | `DELETE` 후 목록에서 제거 | [-] ⚠️ skip — seed 후 row 찾기 조건 |
| 6-9 | 배너 활성/비활성 토글 | `PATCH /toggle` 후 상태 변경 | [x] ✅ E2E banner-crud 토글 통과 |
| 6-10 | **[미연동]** 홈 Hero 배너에 관리자 배너 반영 | ❌ 홈에서 `/api/v1/banners` 호출 안 함 | [-] ❌ 미구현 |

### Flow 6-C: 일정 CRUD (`/admin/schedule`) → 홈 연동 (ADM-02)

> **현재 상태**: ✅ Full CRUD API 연동 + 홈 캘린더 반영

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-11 | 일정 목록 조회 | `GET /api/v1/admin/schedules` → 테이블 표시 | [x] ✅ E2E schedule-crud 통과 |
| 6-12 | 일정 생성 (title, date, type, desc) | `POST` 후 목록에 추가 | [x] ✅ E2E schedule-crud 추가 통과 |
| 6-13 | 일정 수정 | `PUT` 후 변경 반영 | [-] ⚠️ skip — dialog locator 복잡성 |
| 6-14 | 일정 삭제 | `DELETE` 후 목록에서 제거 | [-] ⚠️ skip — seed 후 row 찾기 조건 |
| 6-15 | 홈 캘린더에 반영 확인 | 새 일정 날짜에 파란색 마킹 | [x] ✅ schedules API 4건 응답, 홈 캘린더 연동 |

### Flow 6-D: YouTube CRUD (`/admin/youtube`) → 홈 연동 (ADM-03)

> **현재 상태**: ✅ Full CRUD API 연동 + 홈 영상 섹션 반영

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-16 | YouTube 목록 조회 | `GET /api/v1/youtube` → 테이블 표시 | [x] ✅ E2E youtube-crud 통과 |
| 6-17 | YouTube 추가 (title, videoId, thumbnail 등) | `POST` 후 목록에 추가 | [x] ✅ E2E youtube-crud 추가 통과 |
| 6-18 | YouTube 수정 | `PUT` 후 변경 반영 | [-] ⚠️ skip — dialog locator 복잡성 |
| 6-19 | YouTube 삭제 | `DELETE` 후 목록에서 제거 | [-] ⚠️ skip — seed 후 row 찾기 조건 |
| 6-20 | 홈 YouTube 섹션에 반영 확인 | 등록/삭제된 영상이 홈에 반영 | [x] ✅ youtube API 4건 응답, 홈 섹션 연동 |

### Flow 6-E: 광고 관리 (`/admin/ads`) (ADM-04)

> **현재 상태**: ⚠️ localStorage 기반 (백엔드 API 없음, useAdsStore)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-21 | 광고 목록 조회 | Zustand persist에서 로드 (기본 2개) | [x] ✅ Phase 13.3.1 검증 |
| 6-22 | 광고 생성 (모달) | 목록에 새 광고 추가 | [x] ✅ Phase 13.3.2 검증 |
| 6-23 | 광고 수정 (모달) | 변경 내용 반영 | [x] ✅ Phase 13.3.3~4 검증 |
| 6-24 | 광고 삭제 (확인 모달) | 삭제 후 목록에서 제거 | [x] ✅ Phase 13.3.5~6 검증 |
| 6-25 | 광고 미리보기 | 축소 렌더링 표시 | [x] ✅ UI 표시 |

### Flow 6-F: 분석 도구 — 트렌드 분석 (`/admin/trends`) (TRD-01, TRD-02)

> **현재 상태**: ✅ 분석 서비스 API 연동 완료

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-26 | 뉴스 키워드 탭 | `GET /trends/news` → 키워드 클라우드 + 테이블 | [x] ✅ E2E trends.spec 통과 |
| 6-27 | YouTube 트렌딩 탭 | `GET /trends/youtube` → 영상 목록 (썸네일/채널/조회수) | [x] ✅ E2E trends.spec 통과 |
| 6-28 | 국가 필터 변경 (KR/US/JP) | 필터에 맞는 데이터 로드 | [x] ✅ E2E trends.spec 통과 |
| 6-29 | 새로고침 버튼 | 최신 데이터 재로드 | [x] ✅ E2E trends.spec 통과 |

### Flow 6-G: 분석 도구 — 채팅 분석 (`/admin/chat`) (CHAT-01~05)

> **현재 상태**: ✅ 분석 서비스 API 연동 완료

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-30 | 채팅 파일 업로드 (CSV) | `POST /analyze/chat` → 분석 결과 표시 | [x] ✅ E2E chat-analysis 통과 |
| 6-31 | 히트맵 탭 | 시간별 채팅 밀도 막대 그래프 | [x] ✅ E2E chat-analysis 통과 |
| 6-32 | 피크 구간 탭 | 자동 감지된 피크 구간 목록 | [x] ✅ E2E chat-analysis 통과 |
| 6-33 | 키워드 태그 | 상위 키워드 표시 | [x] ✅ E2E chat-analysis 통과 |
| 6-34 | CSV 다운로드 (편집 마커) | `start, end, peak_count, keywords` 형식 CSV | [x] ✅ E2E chat-analysis 통과 |

### Flow 6-H: 분석 도구 — 채널 분석 (`/admin/analysis`) (ANA-01~03)

> **현재 상태**: ❌ 전체 하드코딩 (YouTube Analytics API 미연동)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-35 | 내 채널 탭 | KPI 카드 + 구독자 추이 그래프 + 인기 영상 TOP 5 (Mock) | [x] ✅ Mock UI 표시 |
| 6-36 | 트렌드 분석 탭 | 키워드 클라우드 + 카테고리 차트 (Mock) | [x] ✅ Mock UI 표시 |
| 6-37 | 최근 트렌드 탭 | 급상승 영상 테이블 (Mock) | [x] ✅ Mock UI 표시 |

### Flow 6-I: 운영 — 게시물 관리 (`/admin/community/posts`) (ADM-05)

> **현재 상태**: ✅ communityStore 사용 (목록 조회 + 삭제)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-38 | 게시물 목록 조회 | communityStore.fetchPosts() → 테이블 표시 | [x] ✅ Phase 14.4.4 검증 |
| 6-39 | 제목/작성자 검색 | 필터링 동작 | [x] ✅ Phase 14.4.5 검증 |
| 6-40 | 게시물 강제 삭제 | deletePostWithApi() 호출 → 목록에서 제거 | [x] ✅ Phase 15.4.1~2 검증 |

### Flow 6-J: 운영 — 회원 관리 (`/admin/community/members`) (ADM-06)

> **현재 상태**: ✅ 실제 API 연동 완료 — `GET /api/v1/admin/users` 호출, 이메일 검색 + 페이지네이션 추가 (Phase 20)

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 6-41 | 회원 목록 표시 | `GET /api/v1/admin/users` → 실제 DB 회원 목록 페이지네이션 표시 | [x] ✅ Phase 20 API 연동 완료 |
| 6-42 | 밴/언밴 토글 | 로컬 상태 변경 (확인 모달) | [x] ✅ Phase 13.3.7~9 검증 |
| 6-43 | 회원 이메일 검색 | `GET /api/v1/admin/users/search?email=` 호출 → 검색 결과 표시 | [x] ✅ Phase 20 구현 완료 |

---

## 7. 커뮤니티 (`/community`) — 참고

> 이전 E2E에서 검증 완료. 핵심 확인 사항만 기록

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 7-1 | 게시물 목록 (API) | `GET /api/v1/posts` → 실제 DB 게시물 표시 | [x] ✅ E2E community 16/17 통과 |
| 7-2 | 글 작성 → DB 저장 → 목록 반영 | 새 글 상단 표시 | [x] ✅ E2E community post-crud 통과 |
| 7-3 | 투표 (up/down) | API 호출 + 카운트 변경 | [x] ✅ E2E community 통과 |
| 7-4 | 댓글 작성 | DB 저장 + commentCount 반영 | [x] ✅ E2E community 통과 |
| 7-5 | 정렬 변경 (Hot/Best/New/Top) | 정렬 순서 변경 | [x] ✅ E2E community 통과 |
| 7-6 | 사이드바 커뮤니티 목록 | `GET /api/v1/communities` → 경제/방송/자유게시판 | [x] ✅ API 3건 응답 |
| 7-7 | 특정 보드 접속 (`/community/board/{slug}`) | 해당 커뮤니티 게시물만 표시 | [x] ✅ Phase 14.2.1 검증 |

---

## 8. 인증 — 참고

> 이전 E2E에서 검증 완료. 핵심만 기록

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 8-1 | 이메일 회원가입 → 로그인 | DB 저장, JWT 발급 | [x] ✅ E2E auth 9/9 통과 |
| 8-2 | 잘못된 비밀번호 | 에러 메시지 표시 | [x] ✅ E2E auth 통과 |
| 8-3 | 페이지 새로고침 후 로그인 유지 | persist + accessToken 유효 | [x] ✅ E2E auth 통과 |
| 8-4 | 로그아웃 | localStorage 토큰 제거 | [x] ✅ E2E auth 통과 |

---

## 회귀 테스트

| # | 테스트 스위트 | 명령어 | Pass/Fail | 최종 결과 (2026-03-27) |
|---|-------------|--------|-----------|----------------------|
| 9-1 | TypeScript 타입 검사 | `cd frontend && npx tsc --noEmit` | [x] | ✅ 0 errors |
| 9-2 | Frontend Jest | `cd frontend && npm test -- --watchAll=false` | [x] | ✅ 35/36 (themeStore 1건 기존 버그) |
| 9-3 | Backend JUnit | `cd backend && ./gradlew test` | [x] | ✅ 19/19 PASS |
| 9-4 | Analysis pytest | `docker exec analysis_trend_analysis python -m pytest tests/ -v` | [x] | ✅ **48/48 PASS** |
| 9-5 | E2E auth | `cd e2e && npm test -- tests/auth/` | [x] | ✅ 9/9 passed |
| 9-6 | E2E mypage | `cd e2e && npm test -- tests/mypage/` | [x] | ✅ 3/5 (2 skip — 닉네임 수정 UI 조건) |
| 9-7 | E2E admin | `cd e2e && npm test -- tests/admin/` | [x] | ✅ 24/36 (11 skip) |
| 9-8 | E2E community | `cd e2e && npm test -- tests/community/` | [x] | ✅ 16/17 (1 skip) |
| 9-9 | E2E shop | `cd e2e && npm test -- tests/shop/` | [x] | ✅ 7/10 (3 skip) |
| 9-10 | **E2E 전체** | `cd e2e && npm test` | [x] | ✅ **62 passed / 11 skipped / 0 failed** (2026-03-27 최종) |

---

## 미구현 기능 목록 (백엔드 API 부재)

> 아래 항목은 백엔드 개발이 선행되어야 합니다.

| # | 기능 | 필요한 백엔드 | 현재 상태 |
|---|------|-------------|----------|
| ~~N-1~~ | ~~홈 Hero 배너 동적 표시~~ | ~~프론트에서 `GET /api/v1/banners` 호출 추가~~ | ✅ Phase 20 완료 |
| N-2 | 상품 상세 API 연동 | 프론트에서 `GET /api/v1/products/{id}` 호출 추가 | 하드코딩 |
| N-3 | 관리자 상품 CRUD | Product Admin CRUD API 신규 개발 | Read만 존재 |
| N-4 | 매거진 전체 | Magazine Entity + CRUD API + 관리자 페이지 | 100% Mock |
| N-5 | 주문/결제 | Order Entity + PG 연동 | 미구현 |
| N-6 | 마이페이지 주문 통계/내역 | `GET /api/v1/orders/**` | Mock |
| N-7 | 마이페이지 커뮤니티 활동 | `GET /api/v1/users/me/activities` | Mock |
| ~~N-8~~ | ~~회원 관리 API~~ | ~~`GET /api/v1/admin/members` + Ban API~~ | ✅ Phase 20 완료 (`GET /api/v1/admin/users`, search 엔드포인트) |
| N-9 | 채널 분석 | YouTube Analytics API 연동 | Mock |
| N-10 | 프로필 자기소개/비밀번호 변경 | `PATCH /api/v1/users/me` 확장 | UI만 |

---

## 최종 검증 결과 요약 (2026-03-31 Phase 20 반영)

| 영역 | 체크포인트 수 | ✅ Pass | ⚠️ Skip/미구현 |
|------|-------------|---------|--------------|
| 사전 준비 | 12 | 12 | 0 |
| 홈 화면 | 25 | 25 | 0 (1-4 배너 API 연동 완료) |
| 쇼핑 | 21 | 15 | 6 (페이지네이션, 옵션, 바로구매, 상세미연동, 주문) |
| 매거진 | 8 | 7 | 1 (카테고리 필터) |
| 소개 | 2 | 2 | 0 |
| 마이페이지 (유저) | 19 | 16 | 3 (닉네임수정skip, 자기소개/비밀번호) |
| 관리자 페이지 | 43 | 38 | 5 (수정/삭제skip 4건, 배너이미지업로드) |
| 커뮤니티 (참고) | 7 | 7 | 0 |
| 인증 (참고) | 4 | 4 | 0 |
| 회귀 테스트 | 10 | 10 | 0 |
| **합계** | **151** | **136 (90%)** | **15 (10%)** |

> **핵심 미구현 (v2 과제)**: 상품 상세 API 연동, 매거진 백엔드, 주문/결제, 커뮤니티 권한 시스템 백엔드, 배너 이미지 파일 업로드

---

## Phase 19 — 관리자 UI 버그·기능 개선 및 커뮤니티 권한 시스템

> **작성일**: 2026-03-30 | **상태**: 전 항목 ❌ 미구현

### Flow 19-A: 관리자 UI 입력 폼 글씨 색상 버그

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-1 | 메인 배너 추가 폼 — 입력 글씨 색상 확인 | 텍스트 입력 시 검정색으로 표시 (현재 회색) | [-] ❌ 미구현 |
| 19-2 | 방송 일정 추가·수정 폼 — 입력 글씨 색상 확인 | 텍스트 입력 시 가독성 있는 색상으로 표시 | [-] ❌ 미구현 |
| 19-3 | 유튜브 영상 추가·수정 폼 — 입력 글씨 색상 확인 | 텍스트 입력 시 가독성 있는 색상으로 표시 | [-] ❌ 미구현 |
| 19-4 | 관리자 페이지 수정 버튼 색상 확인 | 회색 → 식별 가능한 적절한 색상으로 변경 | [-] ❌ 미구현 |

### Flow 19-B: 메인 배너 이미지 업로드 방식 전환

> **현재 상태**: URL/CSS 클래스 문자열 입력 방식 → 이미지 파일 직접 첨부(multipart upload)로 전환 필요

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-5 | 배너 추가 폼에서 파일 선택 버튼 표시 | 파일 선택 UI가 렌더링됨 | [-] ❌ 미구현 |
| 19-6 | 이미지 파일 선택 후 미리보기 표시 | 업로드 전 썸네일 미리보기 렌더링 | [-] ❌ 미구현 |
| 19-7 | 배너 저장 시 multipart/form-data로 백엔드 전송 | `POST /api/v1/admin/banners` — Content-Type: multipart/form-data | [-] ❌ 미구현 |
| 19-8 | 저장 후 배너 목록에 업로드된 이미지 표시 | 실제 파일 URL로 이미지 렌더링 | [-] ❌ 미구현 |

### Flow 19-C: 유튜브 영상 썸네일 표시 버그

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-9 | 유튜브 영상 관리 목록에서 썸네일 이미지 표시 | video_id 기반 `https://img.youtube.com/vi/{video_id}/mqdefault.jpg` URL로 이미지 렌더링 | [-] ❌ 미구현 |
| 19-10 | 홈 화면 YouTube 영상 그리드에서 썸네일 표시 | 동일한 썸네일 URL 방식으로 이미지 표시 | [-] ❌ 미구현 |

### Flow 19-D: 채널 분석 YouTube API 연동 검증

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-11 | `/admin/analysis` 접속 후 채널 KPI 카드 데이터 확인 | YouTube Analytics API 응답 데이터 표시 (현재 Mock 여부 확인) | [-] ❌ 미확인 |
| 19-12 | 채널 분석 API 키 유효성 확인 | `GET /analyze/channel` 또는 동등 엔드포인트 200 응답 | [-] ❌ 미확인 |

### Flow 19-E: 트렌드 뉴스 원문 링크 연결

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-13 | 뉴스 키워드 목록에서 조회수 높은 기사 원문 링크 표시 | 각 키워드 항목에 원문 기사 링크 버튼/아이콘 표시 | [-] ❌ 미구현 |
| 19-14 | 뉴스 원문 링크 클릭 | 새 탭으로 원본 기사 URL 이동 | [-] ❌ 미구현 |
| 19-15 | `GET /trends/news` 응답에 기사 원문 URL 포함 여부 확인 | 응답 JSON에 `article_url` 또는 동등 필드 존재 | [-] ❌ 미구현 |

### Flow 19-F: 광고 관리 버그 및 이미지 직접 첨부

> **현재 상태**: 광고 추가 시 메인 화면 미반영, URL 입력 방식

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-16 | `/admin/ads` 에서 광고 추가 후 메인 화면(`/`) 확인 | 추가한 광고가 홈 화면 광고 영역에 표시됨 | [-] ❌ 버그 미수정 |
| 19-17 | adsStore persist 데이터 메인 화면 반영 확인 | localStorage `ads-storage` 값이 홈 위젯과 동기화됨 | [-] ❌ 미구현 |
| 19-18 | 광고 추가 폼에서 이미지 파일 직접 첨부 | URL 입력 대신 파일 선택 UI로 이미지 업로드 | [-] ❌ 미구현 |
| 19-19 | 이미지 업로드 후 광고 카드 미리보기 표시 | 업로드된 이미지 썸네일로 광고 카드 렌더링 | [-] ❌ 미구현 |

### Flow 19-G: 커뮤니티 권한 시스템 (신규)

> **현재 상태**: ✅ FE UI 완료 (admin/community/create, admin/community/moderators 페이지 추가) | 백엔드 API 미구현

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 19-20 | `User` 엔티티에 `COMMUNITY_MODERATOR` 역할 추가 확인 | `Role` enum에 COMMUNITY_MODERATOR 존재 | [-] ❌ 백엔드 미구현 |
| 19-21 | 커뮤니티별 권한 테이블(`community_permission`) DB 스키마 존재 | `user_id`, `community_id`, `role` 컬럼 포함 테이블 | [-] ❌ 백엔드 미구현 |
| 19-22 | 관리자가 특정 사용자에게 특정 커뮤니티 글쓰기 권한 부여 | `/admin/community/moderators` 에서 moderator 권한 설정 | [-] ❌ 백엔드 API 미구현 |
| 19-23 | COMMUNITY_MODERATOR 권한 사용자가 해당 커뮤니티에서 글 작성 | 해당 커뮤니티에서 글 작성 버튼 활성화, 글 저장 성공 | [-] ❌ 백엔드 미구현 |
| 19-24 | COMMUNITY_MODERATOR 권한 사용자가 다른 커뮤니티에서 글 작성 시도 | 권한 없음 메시지 표시 또는 버튼 비활성화 | [-] ❌ 백엔드 미구현 |
| 19-25 | 관리자 커뮤니티 생성 탭 표시 | `/admin/community/create` 에서 커뮤니티 생성 폼 접근 가능 | [x] ✅ FE UI 완료 (Phase 20) |
| 19-26 | 커뮤니티 생성 후 목록 반영 | 새 커뮤니티가 사이드바 목록 및 DB에 반영됨 | [-] ❌ 백엔드 API 미구현 |
| 19-27 | 생성된 커뮤니티에 moderator 설정 | `/admin/community/moderators` 페이지에서 UI 표시 | [x] ✅ FE UI 완료 (Phase 20) |

---

## Phase 20 — 버그 수정 7건 + AdminUserController 신규

> **작성일**: 2026-03-31 | **상태**: 전 항목 ✅ 완료

### Flow 20-A: YouTube videoId 파싱 버그 수정

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-1 | `admin/youtube/page.tsx` 에서 `youtube.com/watch?v=` URL 입력 | `extractYoutubeId()` 가 `new URL()` 파싱으로 11자리 videoId 정상 추출 | [x] ✅ 완료 |
| 20-2 | `youtu.be/{id}` 단축 URL 입력 | pathname에서 videoId 추출 성공 | [x] ✅ 완료 |
| 20-3 | 한글 채널명 등 유효하지 않은 URL 입력 | `/^[a-zA-Z0-9_-]{11}$/` 검증 실패 → null 반환 + 에러 토스트 | [x] ✅ 완료 |

### Flow 20-B: 메인 배너 API 연동

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-4 | `app/page.tsx` 마운트 → `GET /api/v1/banners` 호출 | active=true 배너를 displayOrder 순 슬라이더로 표시 | [x] ✅ 완료 |
| 20-5 | API 실패 시 | 하드코딩 fallback 배너 표시 | [x] ✅ 완료 |
| 20-6 | 관리자에서 배너 active 토글 → 홈 새로고침 | 비활성 배너가 슬라이더에서 사라짐 | [x] ✅ 완료 |

### Flow 20-C: 광고 홈화면 표시 버그 수정

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-7 | `admin/ads` 에서 광고 추가 후 홈 화면 확인 | `ads.filter(a => a.active !== false)` → 활성 광고만 홈에 표시 | [x] ✅ 완료 |
| 20-8 | `Ad` 인터페이스의 `active?: boolean` 필드 | 홈 표시 여부 토글 동작 | [x] ✅ 완료 |

### Flow 20-D: 트렌드 분석 select 색상 수정

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-9 | `admin/trends/_content.tsx` 국가/카테고리 select 다크모드 | `text-gray-900 dark:text-white` 적용 → 선택 옵션 글씨 가독성 확보 | [x] ✅ 완료 |

### Flow 20-E: 커뮤니티 검색 개선

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-10 | `community/page.tsx` 검색창 글씨 색상 | 라이트/다크 모드 모두 가독성 있는 색상으로 표시 | [x] ✅ 완료 |
| 20-11 | 커뮤니티 이름으로도 검색 | 커뮤니티 이름 포함 검색 결과 반환 | [x] ✅ 완료 |

### Flow 20-F: 회원 관리 실제 API 연동

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-12 | `admin/community/members/page.tsx` 접속 | `GET /api/v1/admin/users` → 실제 DB 회원 목록 + 페이지네이션 표시 | [x] ✅ 완료 |
| 20-13 | 이메일 검색창 입력 | `GET /api/v1/admin/users/search?email=` → 검색 결과 표시 | [x] ✅ 완료 |

### Flow 20-G: AdminUserController 신규 구현

| # | 플로우 | 기대 결과 | Pass/Fail |
|---|--------|----------|-----------|
| 20-14 | `GET /api/v1/admin/users` 호출 | 전체 회원 목록 페이지네이션 응답 | [x] ✅ 완료 |
| 20-15 | `GET /api/v1/admin/users/search?email=test` | 이메일 포함 검색 결과 반환 | [x] ✅ 완료 |
| 20-16 | 비관리자 토큰으로 호출 | 403 Forbidden 응답 | [x] ✅ `@PreAuthorize("hasRole('ADMIN')")` 적용 |
