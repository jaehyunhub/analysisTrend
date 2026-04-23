# analysisTrend

> 경제·시사 유튜브 채널 생태계를 하나로 묶는 통합 플랫폼 — 시청자에게는 커뮤니티·쇼핑을, 운영팀에게는 AI 기반 콘텐츠 인텔리전스를 제공한다.

![stack](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs) ![stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![stack](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot) ![stack](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi) ![stack](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql) ![stack](https://img.shields.io/badge/Redis-7-DC382D?logo=redis) ![stack](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

- **배포 URL**: [syukauniverse.com](https://syukauniverse.com)
- **API**: `api.syukauniverse.com` (Railway) · **Frontend**: Vercel
- **상태**: 77 E2E / 74 passed · 단위 테스트 48 passed(analysis) + Jest 5 stores · 관리자 CRUD 전 도메인 구현 완료

---

## 🧭 프로젝트 한눈에 보기

| 서비스 | 스택 | 역할 |
|---|---|---|
| `frontend/` | Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand | FSD 아키텍처, SSR/ISR, 관리자 콘솔, 커뮤니티·쇼핑 UI |
| `backend/` | Spring Boot 3.5 · Java 17 · JPA · QueryDSL · Redis · JWT + OAuth2 | 도메인 API, 인증, 관리자 권한, `ApiResponse<T>` 표준 응답 |
| `analysis/` | FastAPI · Python · APScheduler · yt-dlp · Naver/YouTube Data API | 채팅 히트맵 분석, 뉴스·YouTube 트렌드 수집, 30분 주기 캐시 |
| `e2e/` | Playwright | 6개 워크플로우 그룹 · 77개 시나리오 |
| `nginx/` | Nginx | 포트 80 단일 진입점, 리버스 프록시 |

---

## ⭐ 핵심 차별점 — Claude Code 하네스 엔지니어링

> 이 프로젝트의 가장 큰 차별점은 **AI 코딩 에이전트(Claude Code)를 단순 코드 생성기가 아닌, 재현 가능한 엔지니어링 환경으로 하네싱(harnessing)했다는 점**이다. 단일 폴더 프로젝트가 아니라, **멀티 서비스 · 멀티 언어 · 멀티 배포 타깃** 환경을 하나의 에이전트가 종단 간 운영할 수 있도록 컨텍스트·툴·권한·메모리를 정교하게 설계했다.

### 1. 계층적 `CLAUDE.md` 컨텍스트 엔지니어링

```
analysisTrend/
├── CLAUDE.md              ← 루트: 빠른 명령어, 인프라, 배포, MCP 개요
├── frontend/CLAUDE.md     ← FSD 구조, Zustand 스토어 매트릭스, 관리자 메뉴 맵
├── backend/CLAUDE.md      ← 패키지 구조, 엔드포인트 테이블, Redis 직렬화 이슈
├── analysis/CLAUDE.md     ← 엔드포인트, 피크 감지 알고리즘, mock 날짜 정책
└── e2e/CLAUDE.md          ← 워크플로우 그룹 설명, 테스트 실행법
```

- **서비스별 가이드 분리** — 프런트/백엔드/분석/E2E 각자 전용 컨텍스트만 로딩하여 토큰 낭비 없이 관련 지식만 활용
- **실패 사례 기록** — "Turbopack이 한글 경로에서 패닉한다", "`GenericJackson2JsonRedisSerializer`는 `@NoArgsConstructor` 필수" 같은 **한 번 겪은 함정을 명문화**해 AI가 반복 실수를 하지 않도록 구성
- **변경 이력 라벨링** — `(2026-04-07)` 같은 날짜 태그로 최근 결정을 우선 반영

### 2. 5개 MCP 서버로 구성한 실시간 인프라 제어

`.mcp.json`에 정의된 통합 서버로 에이전트가 **로컬/클라우드 인프라를 직접 조작**:

| MCP 서버 | 용도 | 활용 예 |
|---|---|---|
| `mysql` | 로컬 DB 질의 | 마이그레이션 검증, 데이터 보정, 실사용 데이터 분석 |
| `redis` | 캐시 진단 | 캐시 키 TTL 검사, `DEL`로 직렬화 포맷 변경 후 초기화 |
| `docker` | 컨테이너 제어 | `docker-compose build analysis` 자동 실행 |
| `railway` | 프로덕션 백엔드·DB | 환경변수 관리, 배포 로그 실시간 스트리밍 |
| `vercel` | 프로덕션 프런트엔드 | 배포 상태 조회, 런타임 로그 확인 |
| `playwright` (추가) | E2E·시각 검증 | 실제 브라우저로 UI 회귀 테스트 |
| `context7` (추가) | 최신 문서 조회 | Next.js 16, Spring Security 6 migration 가이드 |

> "코드를 쓰는 AI"가 아니라 **"배포·DB·캐시·브라우저까지 다루는 AI 오퍼레이터"** 환경을 구축.

### 3. Memory System — 컨텍스트 유지·실수 방지

`~/.claude/projects/…/memory/` 디렉터리에 프로젝트별 장기 기억 파일을 두어 **대화가 끊겨도 아키텍처 판단의 일관성을 유지**:

- `project_architecture_analysis.md` — MSA 재설계 방향
- `project_next_steps.md` — Wave 진행 로드맵
- `project_mcp_infra.md` — MCP·배포 현황 스냅샷

**feedback 타입 메모리**를 적극 활용해 "왜 그렇게 해야 하는가"까지 기록, 엣지 케이스 판단을 에이전트에 위임 가능.

### 4. Permission 엔지니어링 — 반복 프롬프트 제거

`.claude/settings.local.json`에 **read-only 명령 + 자주 쓰는 빌드 커맨드**를 사전 허용 처리하여, 한 번의 `/loop` 루프 안에서 50+ 커맨드를 무중단 실행 가능하도록 설계. 파괴적 동작(`rm -rf`, `git push --force`)은 여전히 수동 승인.

### 5. 멀티 에이전트 & Worktree 격리

- **Explore / Plan / general-purpose 서브에이전트**를 용도별로 분기해 토큰 회계 최적화
- **Git worktree 기반 격리 작업**으로 여러 Wave(기능 단위)를 **병렬 개발**, 메인 브랜치와 충돌 없이 회귀 테스트

### 6. 살아있는 워크플로우 문서 — `claudedocs/`

- `workflow_analysisTrend.md` — 에이전트가 참조하는 "실행 규약"
- `troubleshooting_log.md` — 장애 기록을 구조화 (원인·재현·해결)
- `deployment_railway_vercel.md` — 재배포 절차, 환경변수 맵
- `use_client_vs_ssr.md` — Server Component 전환 의사결정 기록

> 단순한 `README` 문서가 아니라, **AI 에이전트와 인간 개발자가 공유하는 "제2의 소스 코드"**로 취급.

---

## 🏗️ 아키텍처

```
                ┌─────────────────────────────┐
                │   Cloudflare CDN / Vercel   │
                └──────────────┬──────────────┘
                               │
                        ┌──────▼──────┐
                        │   Next.js   │  SSR + ISR (홈 revalidate=60)
                        │  Frontend   │  FSD · Zustand persist
                        └──────┬──────┘
                               │
                   ┌───────────┼───────────┐
                   │                       │
            ┌──────▼──────┐         ┌──────▼──────┐
            │ Spring Boot │         │   FastAPI   │
            │  (Railway)  │         │  (Railway)  │
            │ JWT, OAuth2 │         │  분석 서비스 │
            └──────┬──────┘         └──────┬──────┘
                   │                       │
        ┌──────────┼──────────┐            │
        │                     │            │
  ┌─────▼─────┐         ┌─────▼─────┐  ┌───▼────┐
  │   MySQL   │         │   Redis   │  │ 외부 API │
  │ (Railway) │         │  (캐시)   │  │ Naver,  │
  │           │         │  @Cacheable│  │ YouTube │
  └───────────┘         └───────────┘  └─────────┘
```

### 성능 최적화 포인트

- **홈화면 SSR 전환** — `page.tsx`를 Server Component로 분리, 5개 API 병렬 fetch + `revalidate=60` ISR → **1.2s → 150ms (8배 개선)**
- **Redis `@Cacheable`** — Banner/Schedule/Community 공개 GET에 30분 캐시. `CachingConfigurer` + `CacheErrorHandler`로 Redis 장애 시 DB 폴백
- **CDN 캐시 활성화** — Spring Security 기본 `no-cache` 헤더가 Cloudflare를 막던 이슈를 `CdnCacheFilter`로 `public, max-age=60, s-maxage=300` 주입하여 해결

---

## 🎯 주요 기능

### 시청자 기능
- **커뮤니티** — 게시글·댓글(재귀 트리)·투표·검색·가입, Reddit 스타일 쓰레드 UI, Old Reddit → 모던 카드 리디자인
- **쇼핑몰** — 카테고리 필터, 다중 이미지 슬라이더, Q&A·리뷰, 장바구니(persist)
- **매거진 블록 에디터** — 텍스트·이미지 자유 혼합(`ContentBlock` 유니언 타입), 관리자 저장 → 사용자 페이지 즉시 반영
- **다크모드** — `@variant dark (&:is(.dark *))` 기반, `classList.toggle` 패턴

### 운영자 기능
- **관리자 콘솔** — 배너·방송일정·유튜브·광고·매거진 CRUD, 품절 토글, 다중 이미지 업로드
- **채팅 분석** — yt-dlp로 추출한 live_chat.json 업로드 → 분당 버킷 집계 → `평균 + 1.5σ` 피크 감지 → 편집 하이라이트 자동 추출
- **트렌드 대시보드** — Naver News + YouTube Data API v3 30분 주기 자동 수집, 일일/주간/월간 날짜 필터
- **회원 관리** — 이메일 검색, 역할 기반 접근 제어(`hasRole("ADMIN")`)

### 인증
- **OAuth2 소셜 로그인** — Google / Kakao / Naver, `SessionCreationPolicy.STATELESS`
- **JWT + Refresh Token** — 401 시 `client.ts`가 자동 재발급
- **sessionStorage persist** — 탭/브라우저 닫으면 자동 로그아웃

---

## 🧪 테스트 전략

3계층 테스트 피라미드:

```
E2E (Playwright · 77)         ┌─────────────┐
                              │ Group A~F    │  ← 실제 DB + 브라우저
Integration (JUnit · H2)     ┌┴─────────────┴┐
                             │ Spring Boot    │  ← 도메인 API 계층
Unit (Jest + pytest · 65+)  ┌┴────────────────┴┐
                            │ 스토어 / 파서/서비스│
                            └───────────────────┘
```

- **E2E 6개 그룹** — 홈/관리자 · 커뮤니티 · 쇼핑 · 분석도구 · UX 회귀 · 커뮤니티 종합
- **analysis 48 passed** — `pytest-asyncio` + `AsyncMock` 기반
- **Frontend Jest 5 스토어** — authStore, communityStore, cartStore, toastStore, themeStore

---

## 🚀 배포 & 인프라

### 임시 배포(현재)
| 자원 | 위치 |
|---|---|
| Frontend | Vercel (`syukauniverse.com`) |
| Backend | Railway (`api.syukauniverse.com`) |
| MySQL | Railway (`ballast.proxy.rlwy.net:37097`) |
| Redis | Railway 내부 네트워크 |
| Analysis | Railway (`analysis-production-f8b2.up.railway.app`) |

### 로컬 개발
```bash
docker-compose up -d                # 전체 스택 (Nginx:80, MySQL, Redis, :8080, :3000, :8000)
docker-compose up -d mysql redis    # DB만 (로컬 백엔드 직접 실행 시)
```

### AWS 이전 계획(`claudedocs/infra_design_aws.md`)
EC2(ASG) · RDS · ElastiCache · CloudFront · Route53 구성으로 이관 설계 완료.

---

## 📂 디렉터리 구조

```
analysisTrend/
├── frontend/            # Next.js 16 (FSD)
│   └── src/
│       ├── shared/      # api, types, mocks, model(Zustand), ui
│       ├── entities/    # 도메인 모델·UI (post, product …)
│       ├── features/    # 사용자 기능 (auth, search …)
│       ├── widgets/     # Header, Footer, Sidebar
│       └── app/         # App Router 페이지
├── backend/             # Spring Boot 3.5
│   └── src/main/java/backend/
│       ├── global/      # config, auth, common(ApiResponse)
│       ├── user/ community/ post/ product/ banner/ schedule/ youtube/
├── analysis/            # FastAPI
│   ├── routers/ services/ parsers/ models/ tasks/ tests/
├── e2e/                 # Playwright
├── nginx/               # 리버스 프록시 설정
├── claudedocs/          # 워크플로우·트러블슈팅·인프라 설계 문서
├── PRD.md  SPEC.md  RULES.md
├── CLAUDE.md            # 루트 에이전트 가이드
└── docker-compose.yml
```

---

## 🧠 개발 경험에서 배운 것

**AI 에이전트 시대의 코드베이스는 "두 번 읽힌다"** — 한 번은 사람이, 한 번은 AI가. 이 프로젝트에서 시도한 것은 *두 독자 모두에게 친절한 코드베이스 설계*였다.

- **CLAUDE.md는 문서가 아니라 API다** — 에이전트가 컨텍스트를 로드하는 진입점이며, 서비스별로 쪼개고 실패 사례를 기록해야 토큰 효율이 산다
- **MCP는 "에이전트의 손"이다** — DB·Docker·배포 플랫폼을 직접 제어할 수 없는 AI는 결국 코드만 보는 비서에 그친다
- **Memory는 "프로젝트의 해마(hippocampus)"다** — 대화는 휘발하지만, 의사결정 맥락은 휘발해선 안 된다
- **Permission·Worktree는 "안전한 속도"다** — 과도한 승인 요청은 흐름을 끊고, 무제한 권한은 위험하다. 둘 사이를 설계하는 것이 엔지니어링이다

---

## 📚 문서

- [`PRD.md`](./PRD.md) — Product Requirements Document (v2.7)
- [`SPEC.md`](./SPEC.md) — 기능 스펙
- [`RULES.md`](./RULES.md) — 개발 규약
- [`CLAUDE.md`](./CLAUDE.md) — AI 에이전트 통합 가이드
- [`claudedocs/workflow_analysisTrend.md`](./claudedocs/workflow_analysisTrend.md) — 실행 규약
- [`claudedocs/infra_design_aws.md`](./claudedocs/infra_design_aws.md) — AWS 이전 설계

---

## 👤 Author

**hyun** · jaehyoen3@gmail.com

> *"Claude Code는 도구가 아니라 협업 파트너다 — 그 파트너가 가장 잘 일하도록 환경을 설계하는 것, 그것이 하네스 엔지니어링이다."*
