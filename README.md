# analysisTrend

경제·시사 유튜브 채널 슈카월드의 팬 플랫폼입니다. 커뮤니티·쇼핑몰·매거진을 시청자에게 제공하고, 운영팀에게는 채팅 분석·트렌드 수집 같은 콘텐츠 인텔리전스 도구를 붙였습니다.

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## 주요 기능

**시청자**
커뮤니티(게시글·트리 댓글·투표·검색), 쇼핑몰(다중 이미지 슬라이더·장바구니·Q&A·리뷰), 매거진(텍스트+이미지 블록 에디터), Google·Kakao·Naver 소셜 로그인, 다크모드

**운영자**
배너·방송일정·유튜브·광고·매거진 콘텐츠 CRUD, 채팅 분석(분당 히트맵 + `평균+1.5σ` 피크 자동 감지 → 편집 타임라인 마커), Naver News·YouTube 트렌드 30분 주기 수집, 회원 관리(역할 기반 접근)

---

## 구조

| 서비스 | 스택 | 역할 |
|---|---|---|
| `frontend/` | Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand | FSD 아키텍처, SSR/ISR, 관리자 콘솔 |
| `backend/` | Spring Boot 3.5 · Java 17 · JPA · QueryDSL · Redis · JWT + OAuth2 | 도메인 API, 인증 |
| `analysis/` | FastAPI · Python · APScheduler · yt-dlp · Naver/YouTube API | 채팅 분석, 트렌드 수집 |
| `e2e/` | Playwright | 6개 워크플로우 그룹, 77개 시나리오 |
| `nginx/` | Nginx | 리버스 프록시 |

```
   Cloudflare / Vercel
         │
   ┌─────▼──────┐
   │  Next.js   │  SSR + ISR (홈 revalidate=60)
   └─────┬──────┘
         │
   ┌─────┴──────────┐
   │                │
┌──▼──────────┐ ┌───▼─────────┐
│ Spring Boot │ │   FastAPI   │
│ JWT, OAuth2 │ │  분석 서비스 │
└──┬──────────┘ └───┬─────────┘
   │                │
┌──▼──────┐  ┌──────▼───────────────┐
│  MySQL  │  │ Redis (캐시·세션)    │  외부 API (Naver, YouTube)
└─────────┘  └──────────────────────┘
```

---

## 성능

홈 화면을 Client Component에서 Server Component로 바꾸면서 초기 로딩이 1.2초에서 150ms로 줄었습니다. 5개 API를 순서대로 기다리던 걸 `Promise.all`로 병렬화하고, ISR(`revalidate=60`)로 CDN이 캐시를 잡아주도록 했습니다.

백엔드 공개 GET에는 Redis `@Cacheable`로 30분 캐시를 걸고, Cloudflare 앞단에도 `CdnCacheFilter`로 `s-maxage=300`을 심었습니다. Redis가 죽어도 DB로 폴백하게 처리했습니다.

---

## 테스트

Playwright E2E 77개가 실제 DB + 브라우저 위에서 돌아갑니다. 홈/관리자·커뮤니티·쇼핑·분석·UX·종합 6개 그룹으로 나뉘고, 현재 74 passed / 3 skipped / 0 failed입니다. JUnit 통합 테스트와 Jest + pytest 유닛 테스트 65개도 있습니다.

---

## Claude Code 활용

단순 코드 생성 용도가 아니라, DB·Docker·배포 플랫폼까지 직접 제어하는 개발 환경을 만들어 썼습니다.

서비스별 CLAUDE.md를 분리해서 AI가 필요한 컨텍스트만 읽도록 했고, `mysql`·`redis`·`docker`·`railway`·`vercel`·`playwright`·`context7` 7개 MCP 서버를 연결했습니다. 배포 로그 스트리밍, DB 쿼리, E2E 테스트가 전부 대화 흐름 안에서 처리됐습니다.

CLAUDE.md에 실패 사례를 기록해 두는 게 생각보다 효과가 컸습니다. "Turbopack 한글 경로 패닉", "Redis 역직렬화 `@NoArgsConstructor` 필수" 같은 것들을 적어두면 같은 문제로 시간을 다시 쓰지 않습니다. Memory 파일로 대화가 끊겨도 아키텍처 판단의 일관성을 유지했고, Permission 설계로 읽기 전용 작업은 자동 허용, 파괴적 작업은 수동 승인하는 구조를 잡았습니다.

---

## 실행

```bash
# 전체 스택 (Nginx:80, MySQL, Redis, Backend:8080, Frontend:3000, Analysis:8000)
docker-compose up -d

# 개별 실행
docker-compose up -d mysql redis   # DB만
cd frontend && npm run dev
cd backend && ./gradlew bootRun
cd analysis && uvicorn main:app --reload --port 8000
```

로컬에서 `npm run build`는 Turbopack이 한글 경로에서 죽어서 쓸 수 없습니다. 타입 검사는 `npx tsc --noEmit`으로 합니다.

---

## 배포

| 서비스 | 플랫폼 | 주소 |
|---|---|---|
| Frontend | Vercel | syukauniverse.com |
| Backend | Railway | api.syukauniverse.com |
| MySQL | Railway | ballast.proxy.rlwy.net:37097 |
| Analysis | Railway | analysis-production-f8b2.up.railway.app |

AWS 이전 설계(EC2/RDS/ElastiCache/CloudFront/Route53)는 [`claudedocs/infra_design_aws.md`](./claudedocs/infra_design_aws.md)에 정리해 뒀습니다.

---

**Author**: hyun · jaehyoen3@gmail.com
