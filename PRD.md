# PRD — analysisTrend 플랫폼

> **Product Requirements Document**
> 버전: v1.0 | 작성일: 2026-03-15 | 관련 문서: [SPEC.md](./SPEC.md)

---

## 목차

1. [제품 비전](#1-제품-비전)
2. [문제 정의](#2-문제-정의)
3. [타겟 사용자](#3-타겟-사용자)
4. [사용자 스토리](#4-사용자-스토리)
5. [기능 요구사항](#5-기능-요구사항)
6. [핵심 기능 상세 스펙](#6-핵심-기능-상세-스펙)
7. [API 연동 계획](#7-api-연동-계획)
8. [성공 지표](#8-성공-지표)
9. [MVP vs Phase 2](#9-mvp-vs-phase-2)
10. [비기능 요구사항](#10-비기능-요구사항)
11. [리스크 및 완화 전략](#11-리스크-및-완화-전략)

---

## 1. 제품 비전

> **"경제·시사 유튜브 채널 생태계를 하나의 플랫폼으로 통합 —
> 시청자에게는 커뮤니티와 쇼핑을, 운영자에게는 AI 기반 콘텐츠 인텔리전스를 제공한다."**

analysisTrend는 경제·시사 뉴스를 조사하여 PPT로 정리하고 시청자에게 소개하는 유튜브 채널의 공식 통합 플랫폼이다. 현재 시청자는 유튜브, 커뮤니티, 쇼핑몰을 별개로 방문해야 하고, 채널 운영팀은 자료조사와 영상 편집에 막대한 시간을 쓴다. 이 플랫폼은 이 두 가지 문제를 동시에 해결한다.

---

## 2. 문제 정의

### 2.1 시청자 측 문제

| 문제 | 현재 상황 | 고통 수준 |
|------|----------|---------|
| 유튜브·커뮤니티·쇼핑몰이 각각 별개 사이트 | 시청자가 3개 이상의 사이트를 개별 방문해야 함 | 높음 |
| 전문가 경제 분석 리포트 공유 공간 없음 | 오픈카카오톡, 유튜브 댓글로 분산 | 높음 |
| 채널 관련 상품 구매 경로가 불편 | 외부 쇼핑몰로 이동 후 별도 결제 | 중간 |
| 다음 방송 일정·주제를 한눈에 볼 수 없음 | SNS 또는 유튜브 커뮤니티 탭을 별도 확인 | 중간 |

### 2.2 채널 운영팀 측 문제

| 문제 | 현재 소요 시간 | 목표 절감 |
|------|-------------|---------|
| 경제·시사 트렌드 자료조사 (네이버, 구글, YouTube 개별 확인) | ~1시간/회 | 30% 이상 감소 |
| 라이브 방송 채팅 수동 분석 (영상 편집 하이라이트 구간 파악) | 3~4시간/영상 | 30% 이상 감소 |
| 채널 분석 도구 부재 (어떤 썸네일·콘텐츠가 구독자를 늘리는지 불명확) | 정성적 판단에 의존 | 데이터 기반 의사결정 전환 |
| 배너·방송 일정 등 콘텐츠 변경 시 개발자 의존 | 변경 요청·배포 대기 | 관리자 셀프 서비스 전환 |

---

## 3. 타겟 사용자

### 3.1 Primary — 유튜브 시청자

**페르소나 A: 경제 관심 구독자 (30~40대)**
- 채널 영상을 매주 시청하며 경제 이슈에 관심이 많음
- 다른 시청자 및 전문가와 의견을 교류하고 싶음
- 채널 굿즈나 관련 상품을 구매한 경험 있음
- 핵심 니즈: 커뮤니티, 방송 일정 확인, 쇼핑

**페르소나 B: 라이트 시청자 (20대)**
- 유튜브 알고리즘으로 채널을 발견, 최근 구독
- 콘텐츠 정보를 빠르게 탐색하고 싶음
- 핵심 니즈: 최신 영상 목록, 쉬운 커뮤니티 접근

### 3.2 Secondary — 채널 운영자 및 직원

**페르소나 C: 채널 운영자 (콘텐츠 기획)**
- 경제 트렌드를 파악하고 다음 영상 주제를 결정
- YouTube 채널 성과 데이터로 전략 수립
- 핵심 니즈: 실시간 트렌드, 채널 분석, 관리자 콘텐츠 관리

**페르소나 D: 영상 편집자**
- 라이브 방송 녹화본에서 하이라이트 구간을 찾아 편집
- 채팅 반응이 폭발한 구간이 핵심 편집 포인트
- 핵심 니즈: 채팅 분석, 자동 하이라이트 구간 추출

**페르소나 E: 리서처/작가**
- 영상 기획을 위해 뉴스·트렌드를 수집
- 여러 뉴스 사이트를 순회하며 수동으로 키워드 파악
- 핵심 니즈: 실시간 뉴스 키워드, YouTube 급상승 영상

---

## 4. 사용자 스토리

### 4.1 시청자 스토리

```
US-V-01 (P0) — 커뮤니티 참여
"경제 뉴스에 관심 있는 구독자로서,
채널 커뮤니티에서 전문가 의견과 다른 시청자들의 반응을 보고 싶다.
왜냐하면 유튜브 댓글보다 깊이 있는 토론 공간이 필요하기 때문이다."

인수 기준:
  - Economy/Broadcast/Shopping/Free 게시판에서 게시물 열람 가능
  - 로그인 후 게시물 작성, 업보트/다운보트 가능
  - Hot/Best/New/Top 정렬 기준이 실제 데이터로 동작
```

```
US-V-02 (P1) — 방송 일정 확인
"라이브 방송을 자주 보는 구독자로서,
이번 주 방송 일정과 주제를 홈에서 미리 확인하고 싶다.
왜냐하면 중요한 방송을 놓치지 않으려면 사전에 알아야 하기 때문이다."

인수 기준:
  - 홈 페이지에서 주간 방송 캘린더 표시 (실제 관리자 데이터 연동)
  - 오늘 방송 여부가 즉시 식별 가능
```

```
US-V-03 (P2) — 채널 상품 구매
"채널 팬으로서,
채널 관련 굿즈와 상품을 이 사이트에서 바로 구매하고 싶다.
왜냐하면 현재 외부 쇼핑몰로 이동하는 과정이 번거롭기 때문이다."

인수 기준:
  - 상품 목록에서 카테고리 필터 동작
  - 상품 상세 페이지에서 장바구니 추가 가능
  - 마이페이지에서 주문 내역 확인 가능
```

### 4.2 채널 운영자 스토리

```
US-O-01 (P1) — 채팅 분석으로 영상 편집 효율화  ★ 핵심 차별화
"영상 편집자로서,
라이브 방송 채팅 로그를 업로드하면 시청자 반응이 폭발한 구간을
자동으로 파악하고 싶다.
왜냐하면 현재 채팅 로그 수동 확인에 3~4시간이 소요되기 때문이다."

인수 기준:
  - 채팅 파일(CSV/JSON) 업로드 후 30초 이내 분석 완료
  - 시간대별 채팅 밀도 히트맵 시각화
  - 피크 구간 자동 감지 및 추천 (HH:MM:SS 형식)
  - 편집 마커 CSV 다운로드 기능
  - 특정 키워드(예: "대박", "클립") 반복 시간대 목록 제공
```

```
US-O-02 (P0) — 실시간 트렌드로 자료조사 효율화  ★ 핵심 차별화
"콘텐츠 기획자/리서처로서,
국내외 경제·시사 뉴스 키워드와 YouTube 급상승 영상을
한 화면에서 실시간으로 확인하고 싶다.
왜냐하면 현재 네이버·구글·YouTube를 각각 확인하는 데 1시간 이상 걸리기
때문이다."

인수 기준:
  - 한국 뉴스 상위 키워드 30개가 30분 주기로 갱신
  - YouTube 급상승 영상이 국가·카테고리별로 필터링 가능
  - 각 트렌드 항목에서 원본 기사/영상 링크로 이동 가능
```

```
US-O-03 (P0) — 채널 성과 분석
"채널 운영자로서,
어떤 주제와 썸네일 유형이 구독자 증가에 기여하는지
데이터로 확인하고 싶다.
왜냐하면 현재 YouTube Studio 데이터만으로는 콘텐츠 전략 수립에 한계가
있기 때문이다."

인수 기준:
  - 구독자 수·조회수·시청 시간 KPI 카드 (YouTube Analytics API 연동)
  - 기간별(30/90/365일) 구독자 증감 추이 차트
  - 썸네일 유형별 CTR 비교 (P1)
```

```
US-O-04 (P0) — 관리자 셀프 서비스
"채널 운영자로서,
홈 배너·방송 일정·YouTube 링크를 개발자 없이 직접 수정하고 싶다.
왜냐하면 현재 변경마다 개발자에게 요청하고 배포를 기다려야 하기 때문이다."

인수 기준:
  - 관리자 페이지에서 배너·일정·YouTube 영상 CRUD
  - 변경 사항이 홈 페이지에 실시간 반영
  - ADMIN 역할을 가진 계정만 접근 가능
```

---

## 5. 기능 요구사항

### 우선순위 기준
- **P0** — MVP 필수. 없으면 제품 성립 불가
- **P1** — MVP 이후 빠르게 추가. 핵심 가치 제공에 필요
- **P2** — Phase 2. 경험을 크게 향상시키는 기능

### 5.1 인증 (AUTH)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| AUTH-01 | Google/Kakao/Naver OAuth2 소셜 로그인 | P0 | 구현 완료 |
| AUTH-02 | JWT Access Token (30분) + Redis Refresh Token (7일) | P0 | 구현 완료 |
| AUTH-03 | 관리자/일반 사용자 역할 구분 (ADMIN / USER) | P0 | 구현 완료 |
| AUTH-04 | 프로필 수정 (닉네임, 아바타 이미지) | P1 | UI만 존재 |

### 5.2 홈 대시보드 (HOME)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| HOME-01 | Hero 배너 (관리자 CRUD 데이터 연동) | P0 | 관리자 CRUD API 연동 완료 (BE 구현, FE 연동) |
| HOME-02 | 최신 YouTube 영상 그리드 (YouTube Data API v3 연동) | P0 | 관리자 YouTube CRUD API 연동 완료 |
| HOME-03 | 주간 방송 일정 위젯 (관리자 일정 데이터 연동) | P1 | 관리자 스케줄 CRUD API 연동 완료 |
| HOME-04 | 커뮤니티 인기 게시물 위젯 | P1 | UI 있음, 하드코딩 |
| HOME-05 | 쇼핑 추천 상품 위젯 | P2 | UI 있음, 하드코딩 |

### 5.3 커뮤니티 (COMM)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| COMM-01 | 게시물 CRUD (Economy / Broadcast / Shopping / Free 카테고리) | P0 | 구현 완료 (BE + FE API 연동) |
| COMM-02 | 업보트/다운보트 (Optimistic Update, 중복 투표 취소) | P0 | 구현 완료 (낙관적 업데이트 + API 연동) |
| COMM-03 | 게시물 정렬 (Hot · Best · New · Top 알고리즘) | P0 | 구현 완료 (Hot/Best/New/Top 알고리즘) |
| COMM-04 | 댓글 및 대댓글 작성/삭제 | P1 | 구현 완료 (API 연동, 낙관적 업데이트) |
| COMM-05 | 게시물 검색 (제목·본문, 디바운스) | P1 | 구현 완료 (디바운스 300ms) |
| COMM-06 | 전문가 리포트 플레어(태그) 및 필터링 | P2 | 미구현 |
| COMM-07 | 게시물 신고/숨기기 | P2 | 미구현 |

**정렬 알고리즘 정의**
- **New**: `createdAt DESC`
- **Top**: `(upvotes - downvotes) DESC` (전체 기간)
- **Best**: `(upvotes - downvotes) DESC` (최근 7일)
- **Hot**: `(votes * 시간 가중치)` — Reddit 알고리즘 참고

### 5.4 쇼핑 (SHOP)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| SHOP-01 | 상품 목록 + 카테고리 필터 (GOODS / FOOD / FASHION / DIGITAL) | P0 | 구현 완료 (카테고리 필터, 검색바, 페이지네이션 동작) |
| SHOP-02 | 상품 상세 페이지 (썸네일, 설명, 가격, 구매 버튼) | P0 | 구현 완료 (이미지 슬라이더, 장바구니 담기, Toast 연동) |
| SHOP-03 | 장바구니 추가/삭제/수량 변경 | P1 | 구현 완료 (/shop/cart 페이지, cartStore 연동) |
| SHOP-04 | 주문 및 결제 플로우 (PG 연동) | P2 | 미구현 |
| SHOP-05 | 주문 내역 조회 (마이페이지) | P2 | UI만, 하드코딩 |

### 5.5 마이페이지 (MY)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| MY-01 | 대시보드 (주문 현황 카드, 커뮤니티 활동 통계) | P1 | UI 있음, 하드코딩 |
| MY-02 | 프로필 수정 (닉네임, 자기소개, 아바타) | P1 | UI만 존재 |
| MY-03 | 내 게시물/댓글 목록 | P2 | 미구현 |
| MY-04 | 알림 센터 | P2 | 미구현 |

### 5.6 관리자 — 콘텐츠 관리 (ADM)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| ADM-01 | 홈 배너 CRUD (이미지, 링크, 순서) | P0 | 구현 완료 (BE CRUD + FE 연동, 활성 토글) |
| ADM-02 | 방송 일정 CRUD (날짜, 시간, 제목, 주제) | P0 | 구현 완료 (BE CRUD + FE 연동) |
| ADM-03 | YouTube 영상 링크 관리 (URL, 썸네일, 설명) | P0 | 구현 완료 (BE CRUD + FE 연동) |
| ADM-04 | 광고 슬롯 관리 | P1 | UI 구현 완료 (BE API 없음) |
| ADM-05 | 커뮤니티 게시물 관리 (신고 처리, 강제 삭제) | P1 | UI 구현 완료 |
| ADM-06 | 회원 관리 (역할 변경, 계정 정지) | P1 | UI 구현 완료 |
| ADM-07 | 매거진 콘텐츠 CRUD | P2 | UI만, API 미연동 |

### 5.7 관리자 — 채널 분석 (ANA)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| ANA-01 | 채널 KPI 카드 (구독자 수·조회수·시청 시간·평균 시청 시간) | P0 | UI 구현 완료 (Mock 데이터, YouTube Analytics API 연동 예정) |
| ANA-02 | 구독자 증감 추이 차트 (30/90/365일 선택) | P0 | UI 구현 완료 (Mock 차트) |
| ANA-03 | 상위 퍼포밍 영상 목록 (조회수·CTR·시청 시간 기준) | P0 | UI 구현 완료 (Mock 데이터) |
| ANA-04 | 썸네일 유형별 CTR 분석 (얼굴 유무, 텍스트 비율, 감정) | P1 | 미구현 |
| ANA-05 | 최적 업로드 시간대 추천 (시청자 활동 패턴 기반) | P2 | 미구현 |

### 5.8 관리자 — 트렌드 분석 (TRD)

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| TRD-01 | YouTube 실시간 급상승 동영상 (국가·카테고리 필터) | P0 | 구현 완료 + E2E 검증 완료 (API 키 없으면 mock 데이터 반환) |
| TRD-02 | 실시간 뉴스 키워드 클라우드 (30분 주기 갱신) | P0 | 구현 완료 + E2E 검증 완료 (API 키 없으면 mock 데이터 반환) |
| TRD-03 | 뉴스 기사 원문 링크 + 3줄 요약 | P1 | 미구현 |
| TRD-04 | 트렌드 키워드 시계열 추이 차트 | P1 | 미구현 |
| TRD-05 | 관심 키워드 북마크 및 다음 로그인 시 변화 알림 | P2 | 미구현 |
| TRD-06 | AI 콘텐츠 제안 카드 (LLM 기반 영상 주제 추천) | P2 | 미구현 |
| TRD-07 | Twitch 실시간 인기 스트림·클립 (카테고리 필터) | P2 | 미구현 |

### 5.9 관리자 — 채팅 분석 (CHAT) ★ 핵심 차별화

| ID | 기능 | 우선순위 | 현황 |
|----|------|---------|------|
| CHAT-01 | 라이브 채팅 로그 파일 업로드 (CSV / JSON / TXT) | P1 | 구현 완료 + E2E 검증 완료 |
| CHAT-02 | 특정 키워드 반복 시간대 목록 추출 | P1 | 구현 완료 (TF-IDF 키워드 추출) |
| CHAT-03 | 채팅 밀도 타임라인 히트맵 시각화 | P1 | 구현 완료 (시간 버킷 히트맵 시각화) |
| CHAT-04 | 피크 구간 자동 추출 및 편집 포인트 추천 | P1 | 구현 완료 (평균+2σ 피크 감지) |
| CHAT-05 | 편집 마커 CSV 내보내기 | P1 | 구현 완료 (CSV 편집마커 다운로드) |
| CHAT-06 | 시청자 감정 분석 (긍정 / 부정 / 중립) | P2 | 미구현 |

---

## 6. 핵심 기능 상세 스펙

### 6.1 채팅 분석 (CHAT-01 ~ CHAT-05)

영상 편집 시간 30% 단축을 위한 핵심 기능. FastAPI 분석 서비스(`analysis/main.py`)에 구현한다.

**지원 입력 형식**

| 포맷 | 컬럼 구조 | 비고 |
|------|----------|------|
| CSV | `timestamp, username, message` | 수동 작성 또는 툴 내보내기 |
| JSON | YouTube Live Chat 다운로드 파일 | YouTube Studio 제공 |
| TXT | `[HH:MM:SS] username: message` | 일반 텍스트 파싱 |

**처리 파이프라인 (FastAPI `POST /analyze/chat`)**

```
1. 파일 파싱  → (timestamp_sec, message) 레코드 배열 생성
2. 시간 구간화 → 30초 / 1분 / 5분 버킷 선택 (기본: 1분)
3. 키워드 카운트
   - 사전 설정 키워드: "ㅋㅋ", "ㄷㄷ", "대박", "클립", "진짜", "와" 등
   - TF-IDF 자동 추출: 전체 채팅에서 상위 20개 키워드 추출
4. 밀도 계산  → 버킷별 messages-per-minute 계산
5. 피크 감지  → 평균 + 2σ 초과 버킷을 피크 구간으로 판정
6. 결과 반환  → JSON (히트맵 데이터 + 키워드 타임라인 + 추천 구간)
```

**API 응답 구조**

```json
{
  "duration_sec": 7200,
  "heatmap": [
    { "bucket_start": 0, "bucket_end": 60, "count": 42, "density": "low" },
    { "bucket_start": 8640, "bucket_end": 8700, "count": 450, "density": "peak" }
  ],
  "keywords": [
    { "word": "대박", "occurrences": [154, 8645, 9102] },
    { "word": "클립", "occurrences": [8641, 8659] }
  ],
  "highlights": [
    {
      "start": "02:24:00", "end": "02:26:00",
      "peak_count": 450, "label": "피크 구간 (분당 450채팅)"
    }
  ]
}
```

**프론트엔드 시각화 (`/admin/analysis` — 새 탭 또는 별도 페이지)**

- 타임라인 히트맵: Recharts `BarChart` (x축: 시간, y축: 채팅 수, 피크 구간 강조 색상)
- 키워드 탭: 키워드 선택 → 해당 등장 시간대 하이라이트
- 추천 구간 카드: 클릭 시 해당 시간대 채팅 샘플 10개 표시
- 다운로드 버튼: 편집 마커 CSV (`timestamp, label` 형식)

**수용 기준**

- 50MB 이하 파일 분석 완료 30초 이내
- 파일 업로드 직후 진행률 표시 (polling 또는 WebSocket)
- 키워드 검색창에서 단어 입력 시 해당 구간만 하이라이트
- 히트맵 구간 클릭 → 해당 시간대 채팅 샘플 모달 표시

---

### 6.2 실시간 뉴스 키워드 (TRD-02)

자료조사 시간 30% 단축을 위한 핵심 기능. FastAPI 스케줄러에서 30분마다 수집한다.

**데이터 소스 우선순위**

| 순위 | API | 용도 | 한도 |
|------|-----|------|------|
| 1 | Naver News API | 한국 경제·시사 뉴스 | 25,000 call/일 (무료) |
| 2 | NewsAPI.org | 글로벌 뉴스 | 100 req/일 (무료), $449/월 (유료) |
| 3 | RSS 직접 파싱 | 연합뉴스, 매일경제 등 | 무제한 (비공식) |

**처리 파이프라인 (FastAPI APScheduler, 30분 주기)**

```
1. Naver/NewsAPI에서 최신 뉴스 100개 수집
2. 제목 + 첫 문단 텍스트 추출
3. 한국어 형태소 분석 (KoNLPy Okt 또는 soynlp)
4. TF-IDF 기반 명사 키워드 상위 30개 추출
5. 빈도수·기사 수·이전 회차 대비 순위 변동 계산
6. Redis 저장 (TTL: 30분, Key: "news_keywords")
7. GET /trends/keywords 엔드포인트로 제공
```

**관련 파일**: `analysis/main.py` — 스케줄러 및 엔드포인트 추가

---

### 6.3 YouTube 급상승 영상 (TRD-01)

**API 호출**: YouTube Data API v3 `videos.list` (chart=mostPopular)

```
파라미터:
  - regionCode: KR | US | (글로벌)
  - videoCategoryId: 25 (뉴스), 27 (교육), 24 (엔터) 등
  - part: snippet, statistics
  - maxResults: 20

캐시: Redis TTL 30분 (Key: "trending_{regionCode}_{categoryId}")
```

---

### 6.4 Twitch 인기 스트림·클립 (TRD-07)

실시간으로 어떤 영상 콘텐츠가 인기인지 YouTube 외의 플랫폼까지 확장하는 기능.
Twitch Helix API는 별도 심사 없이 가입 즉시 무료 사용 가능하다.

**Twitch API 선택 이유**

| 비교 항목 | TikTok | Instagram Reels | **Twitch** |
|---------|--------|----------------|-----------|
| 트렌딩 영상 API | ❌ 공개 없음 | ❌ 공개 없음 | ✅ 제공 |
| 가입 즉시 사용 | ❌ 심사 필요 | ❌ 비즈니스 계정 | ✅ Client ID 발급 즉시 |
| 무료 한도 | - | - | 800 req/분 |

**데이터 소스**

| 엔드포인트 | 용도 | 응답 예시 |
|-----------|------|---------|
| `GET /helix/streams` | 현재 시청자 수 기준 인기 방송 | viewer_count, game_name, title |
| `GET /helix/clips` | 최근 7일 인기 클립 영상 | duration, view_count, thumbnail_url, url |
| `GET /helix/games/top` | 인기 게임·카테고리 순위 | game_name, box_art_url |

**처리 파이프라인 (FastAPI `GET /trends/twitch`)**

```
파라미터:
  - type: streams | clips (기본: streams)
  - game_id: 특정 카테고리 필터 (선택)
  - language: ko | en | (전체)
  - first: 20 (기본)

처리 흐름:
1. Twitch App Access Token 발급 (Client Credentials Flow, 60일 만료)
2. Helix API 호출 → 인기 스트림 또는 최근 클립 목록
3. 결과 정규화 (title, thumbnail_url, url, view_count, category)
4. Redis 저장 (TTL: 5분, Key: "twitch_trending_{type}_{language}")
5. GET /trends/twitch 응답
```

**API 응답 구조**

```json
{
  "type": "streams",
  "updated_at": "2026-03-24T12:00:00Z",
  "items": [
    {
      "id": "12345678",
      "title": "스트림 제목",
      "category": "Just Chatting",
      "viewer_count": 12500,
      "thumbnail_url": "https://...",
      "url": "https://www.twitch.tv/streamer_name",
      "language": "ko"
    }
  ]
}
```

**프론트엔드 표시 (`/admin/trends` 트렌드 페이지 내 별도 탭)**

- 카드 그리드: 썸네일 + 제목 + 카테고리 + 시청자 수 / 조회 수
- 탭 전환: 인기 스트림 | 인기 클립
- 언어 필터: 전체 / 한국어 / 영어
- 클릭 시 Twitch 원본 URL 새 탭으로 이동

**수용 기준**

- Twitch API 키 없을 경우 mock 데이터 반환 (YouTube 트렌딩과 동일 패턴)
- 5분 Redis 캐시로 API 호출 최소화
- 스트림 / 클립 탭 전환 즉시 반응 (캐시 히트 시 로딩 없음)

---

### 6.5 채널 분석 (ANA-01 ~ ANA-03)

**API**: YouTube Analytics API (채널 소유자 OAuth2 서비스 계정 필요)

| 지표 | API 메서드 | 파라미터 |
|------|-----------|---------|
| 구독자 수 | `channels.list` | `part=statistics` |
| 구독자 증감 | `reports.query` | `metrics=subscribersGained,subscribersLost` |
| 시청 시간 | `reports.query` | `metrics=estimatedMinutesWatched,averageViewDuration` |
| 상위 영상 | `reports.query` | `dimensions=video`, `sort=-views` |

**캐시**: 채널 통계 1시간 TTL (YouTube API 할당량 절약)

---

## 7. API 연동 계획

### 7.1 외부 API 전체 목록

| 서비스 | API | 용도 | 비용 | 담당 서비스 |
|--------|-----|------|------|------------|
| YouTube Data API v3 | `videos.list`, `search.list`, `channels.list` | 최신 영상, 급상승, 채널 정보 | 무료 (10,000 units/일) | FastAPI |
| YouTube Analytics API | `reports.query` | 채널 성과 분석 | 무료 (OAuth2 필요) | FastAPI |
| Naver News API | 뉴스 검색 | 한국 뉴스 키워드 | 무료 (25,000 call/일) | FastAPI |
| NewsAPI.org | everything | 글로벌 뉴스 | 무료 (100 req/일) | FastAPI |
| Twitch Helix API | `streams`, `clips`, `games/top` | 실시간 인기 스트림·클립 (TRD-07) | 무료 (800 req/분, Client Credentials) | FastAPI |
| Claude API (`claude-sonnet-4-6`) | messages.create | 뉴스 3줄 요약(TRD-03), AI 콘텐츠 제안(TRD-06) | 유료 (input $3/M, output $15/M tokens) | FastAPI |
| OpenAI Vision API (GPT-4o) | chat.completions | 썸네일 이미지 분석(ANA-04) — 대안: Google Cloud Vision | 유료 ($0.005/이미지) | FastAPI |
| 토스페이먼츠 / KG이니시스 | 결제 SDK | 쇼핑 결제 (Phase 2) | 거래 수수료 | Backend |

### 7.2 Redis 캐시 전략

| 데이터 | Key 패턴 | TTL |
|--------|---------|-----|
| YouTube 급상승 영상 | `trending_{regionCode}_{categoryId}` | 30분 |
| 뉴스 키워드 | `news_keywords` | 30분 |
| 뉴스 기사 3줄 요약 (Phase 2) | `news_summary:{article_hash}` | 24시간 (LLM 비용 절감) |
| 채널 통계 | `channel_stats` | 1시간 |
| 최신 영상 목록 | `channel_videos` | 10분 |
| AI 콘텐츠 제안 (Phase 2) | `ai_suggestions:{keyword_hash}` | 1시간 |
| Twitch 인기 스트림 | `twitch_trending_streams_{language}` | 5분 |
| Twitch 인기 클립 | `twitch_trending_clips_{language}` | 5분 |

### 7.3 YouTube API 할당량 관리

- 일일 무료 할당량: 10,000 units
- `search.list` 비용: 100 units/call → 최대 하루 100회 호출
- `videos.list` 비용: 1 unit/call → 제한 없음에 가까움
- **전략**: 최신 영상 목록을 `videos.list` 기반으로 전환하여 할당량 절약
- **폴백**: 할당량 초과 시 마지막 캐시 데이터 반환 (stale-while-revalidate)

---

## 8. 성공 지표

### 8.1 핵심 KPI

| 지표 | 목표 | 측정 방법 | 측정 주기 |
|------|------|----------|---------|
| **MAU** | 유튜브 구독자 수의 20% | GA4 Monthly Active Users | 월별 |
| **재방문율** | 30% 이상 | GA4 Returning User Rate | 주별 |
| **자료조사 시간 감소** | 30% 이상 | 운영팀 Before/After 설문 | 분기별 |
| **영상 편집 시간 감소** | 30% 이상 | 편집자 작업 시간 기록 | 분기별 |

### 8.2 제품 지표

| 지표 | 목표 | 의미 |
|------|------|------|
| 커뮤니티 DAU/MAU | 15% 이상 | 높은 재방문 충성도 |
| 투표 참여율 | 로그인 사용자의 30% | 커뮤니티 활성화 |
| 채팅 분석 사용률 | 영상 업로드 횟수의 80% | 편집자 실질 활용 |
| 트렌드 페이지 평균 세션 시간 | 10분 이상 | 자료조사 도구로 활용 |
| 쇼핑 전환율 | 상세 조회의 3% | 수익 기여 |
| 가입 후 7일 내 첫 게시물 작성 | 10% 이상 | 신규 사용자 활성화 |

### 8.3 측정 인프라

**프론트엔드**: Google Analytics 4 (GA4)
- 커스텀 이벤트: `community_post_created`, `vote_clicked`, `chat_analysis_completed`, `trend_keyword_viewed`, `product_added_to_cart`

**백엔드**: Spring Boot Actuator + Prometheus + Grafana
- API 응답 시간, 오류율, 엔드포인트별 트래픽

**사용자 행동 로그**: `user_activity` 테이블 (user_id, action, metadata, created_at)

---

## 9. MVP vs Phase 2

### MVP ✅ 완료 (2026-03-19 기준)

| 영역 | 포함 기능 | 상태 |
|------|---------|------|
| 인증 | AUTH-01, AUTH-02, AUTH-03 | ✅ E2E 검증 완료 |
| 홈 | HOME-01, HOME-02, HOME-03 | ✅ E2E 검증 완료 |
| 커뮤니티 | COMM-01~05 | ✅ E2E 검증 완료 |
| 쇼핑 | SHOP-01, SHOP-02, SHOP-03 | ✅ E2E 검증 완료 |
| 관리자 콘텐츠 | ADM-01, ADM-02, ADM-03 | ✅ E2E 검증 완료 |
| 채널 분석 | ANA-01, ANA-02, ANA-03 | ✅ Mock 데이터 UI (YouTube Analytics API 연동 예정) |
| 트렌드 분석 | TRD-01, TRD-02 | ✅ E2E 검증 완료 (API 키 없으면 mock 반환) |
| 채팅 분석 | CHAT-01~05 | ✅ E2E 검증 완료 (당초 Phase 2였으나 MVP에 포함 구현) |

### Phase 2 (남은 작업 — 우선순위 순)

| 우선순위 | 기능 | AI 도구 | 이유 |
|---------|------|---------|------|
| 1 | **TRD-03** (뉴스 원문 3줄 요약) | **Claude API** | 자료조사 도구 완성도 — LLM 비용 최소 (기사당 ~$0.0001) |
| 2 | **TRD-04** (키워드 시계열 차트) | 없음 (Recharts) | Redis 30분 스냅샷 → LineChart 시각화 |
| 3 | **TRD-06** (AI 콘텐츠 제안) | **Claude API** | 트렌딩 키워드 + 채널 히스토리 → 영상 주제 추천 |
| 4 | **ANA-04** (썸네일 CTR 분석) | **GPT-4o Vision** | 썸네일 이미지 분석 + YouTube Analytics CTR 상관관계 |
| 5 | **ANA-05** (최적 업로드 시간) | 없음 (scikit-learn) | YouTube Analytics 시청자 활동 패턴 → 통계 분석 |
| 6 | **SHOP-04~05** (결제 + 주문 내역) | 없음 (PG 연동) | 수익 모델 완성 |
| 7 | **TRD-07** (Twitch 인기 스트림·클립) | 없음 (Twitch Helix API) | YouTube 외 플랫폼 트렌딩 확장 — 무료, 즉시 사용 가능 |
| 8 | **COMM-06** (전문가 플레어) | 없음 | 커뮤니티 품질 향상 |

---

## 10. 비기능 요구사항

| 항목 | 요구사항 | 측정 기준 |
|------|---------|---------|
| **성능** | 홈 페이지 LCP 2.5초 이내 | Lighthouse 점수 90+ |
| **가용성** | 월간 99% 이상 | Uptime 모니터링 |
| **보안** | JWT 토큰 만료, HttpOnly 쿠키, XSS 방지 | 코드 감사 |
| **채팅 분석 처리** | 50MB 파일 30초 이내 분석 | 부하 테스트 |
| **트렌드 데이터 신선도** | 최대 30분 지연 허용 | Redis TTL 모니터링 |
| **모바일 반응형** | 375px 이상 전 기능 정상 동작 | Chrome DevTools |
| **접근성** | 키보드 네비게이션, 시맨틱 HTML | Axe 감사 |
| **SEO** | 페이지별 메타데이터, robots.txt, sitemap.xml | Search Console |

---

## 11. 리스크 및 완화 전략

| 리스크 | 발생 가능성 | 영향도 | 완화 전략 |
|--------|-----------|-------|---------|
| YouTube API 일일 할당량(10,000 units) 초과 | 중 | 높음 | Redis 캐시 적극 활용 + `videos.list` 전환으로 할당량 절약 + 초과 시 마지막 캐시 반환 |
| NewsAPI 무료 한도 (100 req/일) 부족 | 높음 | 중 | Naver News API(25,000 call/일)를 1순위로, RSS 파싱을 보조로 운용 |
| 채팅 로그 형식 변경 (YouTube 정책 변경) | 낮음 | 높음 | 파서를 플러그인 구조(Strategy Pattern)로 설계, 포맷별 파서를 독립적으로 교체 가능하게 구성 |
| 대용량 채팅 파일(50MB+) 처리 지연 | 중 | 중 | FastAPI 비동기 처리 + 진행률 WebSocket 또는 polling으로 UX 유지 |
| YouTube Analytics API OAuth2 설정 복잡도 | 높음 | 중 | 서비스 계정 사전 설정, Mock 데이터로 UI 먼저 개발 후 실제 연동 |
| OAuth 제공사(Kakao/Naver) 정책 변경 | 낮음 | 높음 | 이메일/비밀번호 로그인 대안 유지 (LOCAL AuthProvider 구현 완료) |
| Twitch App Access Token 만료 (60일) | 중 | 낮음 | FastAPI 시작 시 자동 재발급 + Redis에 토큰 캐시 (만료 5분 전 선제 갱신) |

---

## Appendix: SPEC.md Phase-Feature 매핑

| SPEC Phase | PRD 기능 ID |
|-----------|------------|
| Phase 1 (Mock 데이터 체계화) | 전체 타입 기반 (AUTH, HOME, COMM, SHOP 데이터 구조) |
| Phase 2 (API 추상화/인증) | AUTH-01~03 |
| Phase 3 (UI/UX 개선) | HOME-03, MY-01 |
| Phase 4 (인터랙션) | COMM-02~05, SHOP-01~03 |
| Phase 5 (백엔드 도메인) | COMM-01, SHOP-01~02 백엔드 |
| Phase 6 (프론트-백엔드 연동) | 전체 API 연동 |
| Phase 7 (관리자/폴리싱) | ADM-01~06, ANA-01~03, TRD-01~02 |
| Phase 8 (인프라) | Nginx 리버스 프록시, docker-compose 운영 수준 개선 |
| Phase 9 (분석 서비스) | CHAT-01~05 (완료), TRD-01~02 (완료) |
| Phase 10 (E2E 테스트) | 73개 테스트 케이스 — 64 통과 / 9 skip / 0 실패 |
| **Phase 11 (v2 — 미구현)** | TRD-03~07, ANA-04~05, SHOP-04~05, COMM-06~07, CHAT-06 |
