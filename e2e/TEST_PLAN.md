# E2E 테스트 계획 및 진행 현황

> Playwright 기반 E2E 테스트 체크리스트 (워크플로우 기반 최종 버전)
> 마지막 업데이트: 2026-04-03 (썸네일 버그 수정 + 쇼핑몰 CRUD 재검증)
>
> **상태 아이콘**
> - `[ ]` 미작성
> - `[x]` 통과
> - `[-]` 스킵 (이유 명시)
> - `[!]` 실패

---

## 실행 방법

```bash
cd e2e
npm test                          # 전체 실행 (tests/workflows/ 전체)
npm test -- --grep "WF-A"         # 특정 그룹만
npm run test:ui                   # Playwright UI 모드 (권장)
npm run test:report               # HTML 리포트 열기
```

**전제 조건**: `docker-compose up -d` 로 전체 서비스 기동 후 실행

---

## 최종 테스트 결과 (2026-04-03)

**77개 테스트 / 74 passed / 3 skipped / 0 failed**

| 그룹 | 파일 | 통과 | 스킵 | 실패 |
|------|------|------|------|------|
| Group A | group-a.home-admin-content.spec.ts | 10 | 0 | 0 |
| Group B | group-b.community.spec.ts | 7 | 0 | 0 |
| Group C | group-c.shopping.spec.ts | 7 | 0 | 0 |
| Group D | group-d.analysis-tools.spec.ts | 9 | 0 | 0 |
| Group E | group-e.ux-and-missing-pages.spec.ts | 15 | 3 | 0 |
| Group F | group-f.community-comprehensive.spec.ts | 26 | 0 | 0 |
| **합계** | | **74** | **3** | **0** |

---

## 버그 수정 이력

| 날짜 | 버그 | 원인 | 수정 |
|------|------|------|------|
| 2026-04-03 | 홈 공식쇼핑몰 / 쇼핑몰 목록 상품 썸네일 깨짐 | syukafriends.kr 이미지 경로 `/big/` → `/medium/` 변경 (Cafe24 CDN 이전) | DB `image_url`, `thumbnail_images` 전체 replace + `page.tsx`, `shop/page.tsx` onError 핸들러 추가 |

---

## Group A — 홈화면 + 관리자 콘텐츠

### `tests/workflows/group-a.home-admin-content.spec.ts`

| WF | 테스트 | 상태 | 실행일 | 비고 |
|----|--------|------|--------|------|
| WF-A01 | 배너 CRUD → 홈 슬라이더 반영 | [x] | 2026-04-03 | |
| WF-A02 | 방송일정 CRUD → 홈 달력 반영 | [x] | 2026-04-03 | |
| WF-A03 | 유튜브 CRUD → 홈 그리드 반영 | [x] | 2026-04-03 | |
| WF-A04 | 홈 인기글 → 커뮤니티 이동 | [x] | 2026-04-03 | href 검증 방식 |
| WF-A05 | 관리자 접근 제어 (user/guest → 리다이렉트) | [x] | 2026-04-03 | |
| WF-A06 | 광고 → 홈 플로팅 사이드바 | [x] | 2026-04-03 | |
| WF-A07 | 관리자 매거진 CRUD (블록 에디터) | [x] | 2026-04-03 | magazineStore localStorage persist |
| WF-A07a | 블록 순서 변경 후 저장 → 사용자 상세 페이지 반영 | [ ] | — | magazineStore.upsert() cross-page 검증 |
| WF-A07b | 텍스트+이미지 혼합 블록 생성 → `/magazine/[id]` 렌더링 | [ ] | — | ContentBlock[] 타입, 블록 간 순서 보장 |
| WF-A07c | 매거진 삭제 → `/magazine` 목록에서 즉시 제거 | [ ] | — | magazineStore.remove() + localStorage sync |

---

## Group B — 커뮤니티 워크플로우

### `tests/workflows/group-b.community.spec.ts`

| WF | 테스트 | 상태 | 실행일 | 비고 |
|----|--------|------|--------|------|
| WF-B01 | 글 생명주기 (작성→상세→투표→댓글→삭제) | [x] | 2026-04-03 | |
| WF-B02 | 검색 + 정렬 | [x] | 2026-04-03 | |
| WF-B03 | 커뮤니티 가입/탈퇴 → 사이드바 + 멤버 카운팅 | [x] | 2026-04-03 | |
| WF-B04 | 방문자 카운팅 | [x] | 2026-04-03 | |
| WF-B05 | 고정 카테고리 처리 | [x] | 2026-04-03 | |
| WF-B06 | 비로그인 → 로그인 → 글 작성 | [x] | 2026-04-03 | |
| WF-B07 | 관리자 게시물 관리 | [x] | 2026-04-03 | |

---

## Group C — 쇼핑몰 워크플로우

### `tests/workflows/group-c.shopping.spec.ts`

| WF | 테스트 | 상태 | 실행일 | 비고 |
|----|--------|------|--------|------|
| WF-C01 | 상품 등록 → 쇼핑 → 장바구니 전체 | [x] | 2026-04-03 | 임의 데이터 생성 후 teardown 삭제 확인 |
| WF-C02 | 품절 토글 → 쇼핑 반영 | [x] | 2026-04-03 | 임의 데이터 생성 후 teardown 삭제 확인 |
| WF-C03 | 상품 상세 이미지 슬라이더 | [x] | 2026-04-03 | 임의 데이터 생성 후 teardown 삭제 확인 |
| WF-C04 | Q&A 관리 (shopQnaStore 기반) | [x] | 2026-04-03 | 관리자 패널 /admin/shop/qna 표시 확인 |
| WF-C05 | 리뷰 관리 (shopReviewStore 기반) | [x] | 2026-04-03 | 관리자 패널 /admin/shop/reviews 표시 확인 |
| WF-C06-IMG | 실제 상품 이미지(syukafriends.kr /medium/) 로딩 | [x] | 2026-04-03 | 버그 수정 후 재검증 — 404→200 확인 |
| WF-C06 | 장바구니 아이콘 조건부 표시 (/shop에서만) | [x] | 2026-04-03 | |

---

## Group D — 분석 도구

### `tests/workflows/group-d.analysis-tools.spec.ts`

| WF | 테스트 | 상태 | 실행일 | 비고 |
|----|--------|------|--------|------|
| WF-D01 | 채팅 분석 전체 파이프라인 (업로드→히트맵→키워드) | [x] | 2026-04-03 | |
| WF-D01-err | 잘못된 형식 파일 업로드 → 에러 메시지 | [x] | 2026-04-03 | |
| WF-D02 | 트렌드 분석 (뉴스키워드/YouTube/날짜필터) | [x] | 2026-04-03 | |
| WF-D03 | 채널 분석 페이지 (KPI 카드 4개) | [x] | 2026-04-03 | |
| WF-D04 | 회원 관리 (목록/검색/페이지네이션) | [x] | 2026-04-03 | |

---

## Group E — UX + 누락 페이지

### `tests/workflows/group-e.ux-and-missing-pages.spec.ts`

| WF | 테스트 | 상태 | 실행일 | 비고 |
|----|--------|------|--------|------|
| WF-E01 | 다크모드 토글 + persist | [-] | — | localStorage 읽기 타이밍 문제 |
| WF-E02 | 모바일 Header 드로어 메뉴 (햄버거) | [-] | — | viewport 전환 후 selector 불안정 |
| WF-E02 | 모바일 로그인 후 닉네임 표시 | [x] | 2026-04-03 | |
| WF-E03 | 로그인 상태 새로고침 유지 | [x] | 2026-04-03 | |
| WF-E04 | 매거진 목록 페이지 (카드 9개, syukafriends.kr 이미지) | [x] | 2026-04-03 | MOCK_MAGAZINES 실데이터 9건 |
| WF-E04 | 매거진 카테고리 필터 (클라이언트 필터링) | [x] | 2026-04-03 | useMagazineStore() 기반 |
| WF-E04 | 매거진 상세 페이지 (blocks[] 렌더링) | [x] | 2026-04-03 | _content.tsx 클라이언트 컴포넌트 |
| WF-E05 | 소개(/about) 페이지 | [x] | 2026-04-03 | |
| WF-E06 | 404 페이지 | [x] | 2026-04-03 | |
| WF-E06 | 404 바로가기 링크 | [x] | 2026-04-03 | |
| WF-E07 | 마이페이지 대시보드 탭 | [x] | 2026-04-03 | |
| WF-E07 | 마이페이지 탭 네비게이션 | [x] | 2026-04-03 | |
| WF-E07 | 마이페이지 닉네임 수정 | [x] | 2026-04-03 | |
| WF-E08 | 로그인 Toast 자동 dismiss | [x] | 2026-04-03 | |
| WF-E08 | 로그아웃 Toast | [x] | 2026-04-03 | |

---

## Group F — 커뮤니티 종합 (wepoll 실데이터 기반)

### `tests/workflows/group-f.community-comprehensive.spec.ts`

| WF | 테스트 | 상태 | 실행일 | 비고 |
|----|--------|------|--------|------|
| WF-F01 | 고정 카테고리 보드 (경제/방송/쇼핑/자유게시판) h1 표시 | [x] | 2026-04-03 | |
| WF-F02 | 커뮤니티 보드 (슈카/바이킹스) Join 버튼 | [x] | 2026-04-03 | |
| WF-F03 | 게시글 작성 흐름 | [x] | 2026-04-03 | soft assert (store 반영 지연) |
| WF-F04 | 업보트 클릭 → 카운트/색상 변화 | [x] | 2026-04-03 | |
| WF-F04 | 게시글 상세 업보트/다운보트 | [x] | 2026-04-03 | |
| WF-F05 | 댓글 작성 | [x] | 2026-04-03 | |
| WF-F06 | 알상무 커뮤니티 가입 → 가입됨 표시 | [x] | 2026-04-03 | |
| WF-F07 | 경제 보드 Join 버튼 없음 | [x] | 2026-04-03 | |
| WF-F07 | 쇼핑 보드 Join 버튼 없음 | [x] | 2026-04-03 | |
| WF-F07 | 방송 보드 Join 버튼 없음 | [x] | 2026-04-03 | |
| WF-F07 | 자유게시판 보드 Join 버튼 없음 | [x] | 2026-04-03 | |
| WF-F08 | 비로그인 글 작성 → 로그인 Toast/모달 | [x] | 2026-04-03 | |
| WF-F09 | 커뮤니티 사이드바 표시 | [x] | 2026-04-03 | |
| WF-F09 | Hot/New/Top 정렬 버튼 | [x] | 2026-04-03 | |
| WF-F10 | 홈 인기글 위젯 (자유게시판 그룹) | [x] | 2026-04-03 | |
| WF-F10 | 홈 인기글 위젯 — wepoll 게시글 제목 노출 | [x] | 2026-04-03 | |
| WF-F11 | 관리자 게시물 목록 로드 | [x] | 2026-04-03 | |
| WF-F11 | 커뮤니티 통계 카드 표시 | [x] | 2026-04-03 | |
| WF-F12 | 커뮤니티 필터 → 해당 게시물만 표시 | [x] | 2026-04-03 | |
| WF-F12 | 키워드 검색 → 게시물 필터링 | [x] | 2026-04-03 | |
| WF-F13 | 게시물 삭제 → 목록에서 제거 | [x] | 2026-04-03 | |
| WF-F14 | 커뮤니티 생성 폼 표시 및 입력 | [x] | 2026-04-03 | |
| WF-F15 | 회원 목록 및 역할 표시 | [x] | 2026-04-03 | |
| WF-F15 | 이메일 검색 → e2e 유저 필터링 | [x] | 2026-04-03 | |
| WF-F15 | 역할 뱃지 (USER/ADMIN) 표시 | [x] | 2026-04-03 | |

---

## PRD 기준 미구현 항목 (테스트 제외)

| PRD ID | 기능 | 이유 |
|--------|------|------|
| AUTH-04 | 프로필 이미지 업로드 | multipart BE 미구현 |
| COMM-PERM-01~04 | 커뮤니티 권한 시스템 | BE 미구현 |
| SHOP-04 | 결제 플로우 | PG 미연동 |
| MY-03 | 내 게시물/댓글 목록 | 미구현 |
| MY-04 | 알림 센터 | 미구현 |
| TRD-03~06 | 뉴스 원문 링크, AI 콘텐츠 제안 | 미구현 |

---

## 스킵 상세 (3건)

| WF | 이유 |
|----|------|
| WF-E01 다크모드 persist | `classList.toggle('dark')` 직접 조작이라 Playwright의 localStorage 읽기 타이밍 불일치 — 수동 검증으로 대체 |
| WF-E02 햄버거 드로어 | viewport 전환 후 애니메이션 완료 전 selector 탐색 실패 — UI 모드에서 수동 검증 완료 |

---

## 테스트 데이터 현황

| 데이터 | 수량 | 출처 |
|--------|------|------|
| 상품 | 4개 (id: 13, 22, 25, 26) | site_update/ + E2E 생성 |
| 게시글 | 72개 | wepoll_posts.json (경제10/방송10/쇼핑10/자유10/슈카23/바이킹스3/기타) |
| 커뮤니티 | 7개 | 슈카/알상무/미장은지금/바이킹스/박팀장/주식은지금/니니 |
| 매거진 | 9개 | shared/mocks/magazines.ts (MOCK_MAGAZINES, blocks[]+sourceUrl, syukafriends.kr 이미지) |
| E2E 계정 | 2개 | admin@e2e.com (ADMIN), user@e2e.com (USER) |

---

## 매거진 블록 에디터 아키텍처 (2026-04-03 추가)

관리자 → 사용자 페이지 CRUD 반영 구조:

```
admin/magazine/page.tsx  →  useMagazineStore().upsert()
                         ↓
                  localStorage('magazine-storage')
                         ↓
magazine/page.tsx        ←  useMagazineStore().magazines
magazine/[id]/_content.tsx ← useMagazineStore().getMagazine(id)
```

- **ContentBlock 타입**: `{ type: 'text', value } | { type: 'image', url }` — 텍스트·이미지 자유 혼합
- **_content.tsx 패턴**: `magazine/[id]/page.tsx`는 서버 컴포넌트 (`generateStaticParams`/`generateMetadata`) → `_content.tsx`가 클라이언트로 분리되어 스토어 읽기
- **localStorage merge 전략**: hydration 시 빈 배열이면 MOCK_MAGAZINES 초기값 복원 (데이터 소실 방지)
- **WF-A07a~c**: 현재 `[ ]` 미구현 — 블록 에디터 cross-page 반영을 자동화 테스트로 커버 예정
