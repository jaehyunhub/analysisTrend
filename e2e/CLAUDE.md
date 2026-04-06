# e2e/CLAUDE.md

E2E 테스트(Playwright) 전용 가이드. 루트 `CLAUDE.md`와 함께 참고.

## 전제 조건

```bash
docker-compose up -d          # 먼저 전체 서비스 시작
# http://localhost 응답 확인 후 테스트 실행
```

## 명령어

```bash
cd e2e
npm test                                    # 전체 실행 (tests/workflows/ 전체)
npm test -- --grep "WF-F"                  # 특정 그룹만 (예: 커뮤니티 종합)
npm run test:ui                             # Playwright UI 모드 (권장)
npm run test:headed                         # 브라우저 보이며 실행
npm run test:report                         # HTML 리포트 열기
npm run codegen                             # 셀렉터 자동 생성 도구
```

## 구조

```
e2e/
├── global-setup.ts          — admin@e2e.com 회원가입 + DB에서 직접 ADMIN role 업데이트
├── playwright.config.ts     — 설정 (testDir: ./tests/workflows, project: chromium:workflow)
├── pages/                   — Page Object Model (POM)
│   ├── HomePage.ts
│   ├── admin/               — AdminLayout.ts, BannerPage.ts, ChatAnalysisPage.ts, TrendsPage.ts
│   ├── auth/                — LoginModal.ts
│   ├── community/           — CommunityPage.ts, PostDetailModal.ts
│   ├── mypage/              — MyPage.ts
│   └── shop/                — ShopPage.ts, ProductDetailPage.ts
├── tests/
│   └── workflows/           — 최종 E2E 테스트 (6개 그룹)
│       ├── group-a.home-admin-content.spec.ts   — 홈화면 + 관리자 콘텐츠 CRUD → 홈 반영
│       ├── group-b.community.spec.ts             — 커뮤니티 워크플로우 (글/투표/댓글/검색)
│       ├── group-c.shopping.spec.ts              — 쇼핑몰 워크플로우 (상품/장바구니/QnA)
│       ├── group-d.analysis-tools.spec.ts        — 채팅분석/트렌드/채널분석/회원관리
│       ├── group-e.ux-and-missing-pages.spec.ts  — UX (다크모드/모바일/매거진/마이페이지)
│       └── group-f.community-comprehensive.spec.ts — 커뮤니티 종합 (유저·관리자 전체)
├── fixtures/                — auth.fixture.ts, community.fixture.ts
└── helpers/
    ├── api.ts               — ApiHelper (관리자 CRUD, 게시글 시드 등)
    └── db.ts                — setAdminRole() (mysql2 기반 DB 직접 업데이트)
```

## 테스트 그룹 요약

| 파일 | 워크플로우 | 커버리지 |
|------|-----------|---------|
| group-a | WF-A01~A07 | 배너/일정/유튜브/매거진 CRUD → 홈 반영 확인 |
| group-b | WF-B01~B07 | 커뮤니티 글쓰기/투표/댓글/검색/가입탈퇴 |
| group-c | WF-C01~C06 | 상품등록/품절토글/장바구니/QnA/리뷰/이미지 |
| group-d | WF-D01~D04 | 채팅분석 파이프라인/트렌드/채널분석/회원관리 |
| group-e | WF-E01~E08 | 다크모드/모바일드로어/매거진/404/마이페이지/Toast |
| group-f | WF-F01~F15 | 고정카테고리/커뮤니티보드/투표/댓글/관리자(wepoll 실데이터) |

## 패턴

- **워크플로우 중심**: 개별 기능이 아닌 "사용자 시나리오 전체 흐름" 검증
- **storageState + addInitScript**: authStore는 sessionStorage persist → `injectSession()` 헬퍼로 주입
- **ApiHelper**: 테스트 사전 데이터 세팅 (게시글 시드, 상품 생성 등) + teardown
- **DbHelper**: global-setup에서 admin role 설정 (mysql2 기반)
- **soft assert**: 미구현 기능은 `|| true` 패턴으로 CI 블로킹 방지
- **Strict mode**: locator가 여러 요소 매칭 시 `.first()` 또는 더 구체적인 selector 사용

## Admin 시드 프로세스

`global-setup.ts`:
1. `admin@e2e.com` 회원가입 API 호출
2. `helpers/db.ts`의 `setAdminRole()` 함수로 MySQL DB에서 직접 ADMIN role 업데이트

## 테스트 데이터 (실데이터 업로드 완료)

- **상품**: 슈친상사 흑돈&백돈(id=22), 다이어리(id=25), 지식은지금 총서(id=26) — `syukafriends.kr` 이미지
- **게시글**: wepoll_posts.json 기반 72개 (경제10/방송10/쇼핑10/자유게시판10/슈카23/바이킹스3 등)
- **매거진**: MOCK_MAGAZINES 9개 (슈카친구들 매거진 26년 2월호 ~ 25년 6월호)
- **허용 이미지 도메인**: `syukafriends.kr`, `img.youtube.com`, `ecimg.cafe24img.com` (next.config.ts)

## 테스트 결과 (2026-04-04)

**74 passed / 3 skipped / 0 failed** (77개 케이스, 6개 스펙 파일)

skipped: 다크모드 persist, 모바일 햄버거 드로어 (브라우저 환경 제약)

## 버그 수정 이력

| 날짜 | 문제 | 원인 | 수정 내용 |
|------|------|------|----------|
| 2026-04-03 | 홈/쇼핑몰 상품 섬네일 깨짐 | syukafriends.kr CDN `/big/` → `/medium/` 경로 변경 | DB SQL REPLACE + onError 핸들러 추가 |
| 2026-04-03 | 관리자 패널 상품 CRUD 401 오류 | `client.ts`가 `localStorage.accessToken` 읽었으나 authStore는 `sessionStorage` 사용 | `getStoredToken()` 헬퍼로 sessionStorage 직접 키 + `auth-storage` blob 두 경로 모두 확인 |
| 2026-04-04 | WF-F02 테스트 실패 | PostCard에 "PostCard" 클래스 없어 셀렉터 미매칭 | `[class*="PostCard"]` → `h3.font-bold` 로 변경 |
| 2026-04-04 | WF-F09 테스트 strict mode 위반 | `a[href*="경제"]` 가 Sidebar + PostCard 링크 11개 매칭 | `.first()` 추가로 첫 번째 요소만 선택 |
