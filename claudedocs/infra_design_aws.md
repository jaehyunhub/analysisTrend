# analysisTrend — AWS 인프라 최종 설계서

> 대상: 인프라 입문 엔지니어
> 작성일: 2026-04-05
> 목표: 이 문서 하나로 AWS 배포부터 장애 대응, 확장 계획까지 전부 커버

---

## 목차

1. [한 줄 요약](#1-한-줄-요약)
2. [전체 구조 한눈에 보기](#2-전체-구조-한눈에-보기)
3. [서비스 배치 전략](#3-서비스-배치-전략)
4. [네트워크 설계 VPC](#4-네트워크-설계-vpc)
5. [서버 자동 확장 Auto Scaling](#5-서버-자동-확장-auto-scaling)
6. [트래픽 폭발 대응 전략](#6-트래픽-폭발-대응-전략)
7. [데이터베이스 전략](#7-데이터베이스-전략)
8. [Redis 캐싱 전략](#8-redis-캐싱-전략)
9. [CI/CD 파이프라인](#9-cicd-파이프라인)
10. [모니터링 설계](#10-모니터링-설계)
11. [보안 설계](#11-보안-설계)
12. [비용 계획](#12-비용-계획)
13. [제약사항 및 한계](#13-제약사항-및-한계)
14. [단계별 확장 로드맵](#14-단계별-확장-로드맵)
15. [초기 세팅 체크리스트](#15-초기-세팅-체크리스트)
16. [장애 대응 매뉴얼 Runbook](#16-장애-대응-매뉴얼-runbook)

---

## 1. 한 줄 요약

> **"지금은 Auto Scaling으로 버티고, 트래픽 보고 쪼갠다"**

- 지금: Vercel(프론트) + AWS ECS(백엔드+분석) + RDS + ElastiCache
- 트래픽 스파이크: ECS Auto Scaling이 자동으로 서버 늘림
- 나중에: 쇼핑/커뮤니티 서비스 분리 (MSA)

---

## 2. 전체 구조 한눈에 보기

```
[사용자]
   │ HTTPS
   ▼
[Route 53] ← DNS. "analysistrend.com이 어디 있지?" 찾아주는 전화번호부
   │
   ▼
[Vercel] ← Next.js 프론트엔드. git push 하면 자동 배포
   │ /api/* 요청만 아래로
   ▼
[AWS ALB] ← 로드밸런서. 트래픽을 컨테이너들에 나눠줌
   │
   ├──→ [ECS: backend]  Spring Boot :8080  (컨테이너 최소 2개)
   │         │
   └──→ [ECS: analysis] FastAPI    :8000  (컨테이너 최소 1개)
             │
    ┌────────┴────────┐
    │                 │
[RDS Aurora]   [ElastiCache]
 MySQL 8.0      Redis 7.x
 Multi-AZ       캐시/세션
    │
   [S3] ← 이미지, 파일 저장
   [ECR] ← Docker 이미지 저장소
   [Secrets Manager] ← DB 패스워드, JWT 키 등
   [CloudWatch] ← 로그, 메트릭, 알람
```

---

## 3. 서비스 배치 전략

### 왜 프론트만 Vercel인가?

```
선택지 A: 전부 AWS
  비용: 월 $200~250
  프론트 배포: 복잡함 (ECS + CloudFront 직접 설정)
  관리: 힘듦

선택지 B: Vercel + AWS  ← 이걸 선택
  비용: 월 $70~100 (Vercel 무료 플랜 사용 시)
  프론트 배포: git push 하면 자동 완료
  관리: 쉬움
  실무: 이 패턴이 스타트업 표준
```

**Next.js는 Vercel이 만들어서 궁합이 완벽**
- 자동 CDN (전 세계 빠름)
- 자동 HTTPS
- 자동 미리보기 URL (PR마다 별도 URL 생성)
- 무료 플랜: 트래픽 100GB/월

### Analysis 서비스를 항상 켜야 하나?

```
Analysis 서비스가 하는 일:
  - 채팅 파일 분석 → 사람이 파일 올릴 때만 실행
  - 트렌드 수집    → 30분마다 한 번

→ 24시간 켜둘 필요가 없음

선택지:
  ECS 상시 실행: 월 $15~30 (항상 켜져 있음)
  ECS 최소 실행: 태스크 1개만 유지 (비용 절감)

→ 지금은 ECS 태스크 1개 유지, 나중에 Lambda 전환 고려
```

---

## 4. 네트워크 설계 VPC

**VPC = 우리만의 사설 네트워크. 외부에서 직접 못 들어옴.**

```
VPC: 10.0.0.0/16  (서울 리전: ap-northeast-2)
│
├── Public Subnet  ← 인터넷에서 직접 접근 가능
│   ├── 10.0.1.0/24 (AZ-a) → ALB 배치
│   └── 10.0.2.0/24 (AZ-b) → ALB 배치
│
└── Private Subnet ← 인터넷에서 직접 접근 불가 (보안)
    ├── 10.0.11.0/24 (AZ-a) → ECS 컨테이너, RDS Primary
    └── 10.0.12.0/24 (AZ-b) → ECS 컨테이너, RDS Replica
```

**핵심 규칙: ALB만 Public, 나머지는 전부 Private**

```
잘못된 예시 (절대 하면 안 됨):
  RDS를 Public Subnet에 배치 → 인터넷에서 DB 직접 접근 가능 → 해킹 위험

올바른 예시:
  사용자 → ALB(Public) → ECS(Private) → RDS(Private)
  외부에서 DB에 직접 접근하는 경로 자체가 없음
```

### 보안그룹 설정 (방화벽 규칙)

```
sg-alb (ALB용)
  들어오는 트래픽: 443 (HTTPS) — 인터넷 전체 허용
  나가는 트래픽:  3000 → ECS frontend
                  8080 → ECS backend

sg-backend (Spring Boot)
  들어오는 트래픽: 8080 — ALB에서만 허용
  나가는 트래픽:  3306 → RDS
                  6379 → Redis
                  8000 → Analysis 서비스

sg-analysis (FastAPI)
  들어오는 트래픽: 8000 — Backend에서만 허용
  나가는 트래픽:  443 → 외부 API (뉴스, YouTube API)

sg-rds (RDS)
  들어오는 트래픽: 3306 — Backend에서만 허용
  나가는 트래픽:  없음

sg-redis (ElastiCache)
  들어오는 트래픽: 6379 — Backend에서만 허용
  나가는 트래픽:  없음
```

---

## 5. 서버 자동 확장 Auto Scaling

**쇼핑이나 커뮤니티에 트래픽이 갑자기 몰려도 자동으로 서버가 늘어남**

```
평소 (낮):
  Backend 컨테이너 2개
  CPU 30%, 메모리 40%

이벤트/트래픽 폭발:
  CPU 60% 초과 감지
      │
      ▼ (60초 이내)
  Backend 컨테이너 2개 → 4개 자동 추가
      │
  CPU 정상화

트래픽 빠짐:
  CPU 20% 이하 5분 유지
      │
      ▼ (300초 후)
  Backend 컨테이너 6개 → 2개로 자동 감소
  (비용 자동 절감)
```

### ECS Auto Scaling 설정값

```yaml
# backend 서비스 기준
MinCapacity: 2    # 최소 2개 (AZ-a, AZ-b 각 1개씩 — 이중화)
MaxCapacity: 10   # 최대 10개까지 자동 확장
TargetCPU: 60%    # CPU 60% 넘으면 확장 시작
ScaleOutCooldown: 60초   # 너무 빠른 확장 방지 (60초 기다림)
ScaleInCooldown:  300초  # 너무 빠른 축소 방지 (5분 기다림)

# analysis 서비스 기준 (덜 중요)
MinCapacity: 1
MaxCapacity: 3
TargetCPU: 70%
```

### ALB 헬스체크 (죽은 컨테이너 자동 제외)

```
ALB가 30초마다 체크:
  GET /actuator/health → 200 OK면 정상
  2번 연속 실패        → 해당 컨테이너 트래픽 제외
  3번 연속 성공        → 다시 트래픽 포함

컨테이너 1개 죽어도:
  - ALB가 30초 내 감지
  - 나머지 컨테이너로 트래픽 전환
  - 사용자는 잠깐 느려짐 or 아예 모름
```

---

## 6. 트래픽 폭발 대응 전략

### 현재 문제 (모놀리식의 한계)

```
지금 백엔드 구조:
┌─────────────────────────────────┐
│  쇼핑 API + 커뮤니티 API + 인증  │  ← 한 덩어리
└─────────────────────────────────┘

쇼핑 이벤트로 트래픽 폭발
       │
       ▼
백엔드 전체 CPU 100%
       │
       ▼
커뮤니티도 느려짐
인증도 느려짐      ← 쇼핑 때문에 전체가 피해
```

### 단계별 대응

#### 1단계: 지금 — Auto Scaling + 캐싱

```
추가 비용: $0 (설정만)
효과: 트래픽 3~5배 감당 가능

- ECS Auto Scaling: 트래픽 오면 서버 자동 증가
- Redis 캐싱:       상품 목록 캐싱 → DB 부하 70% 감소
- RDS Read Replica: 읽기는 Replica로 분산
```

#### 2단계: DAU 1만 이상 — DB 분리

```
추가 비용: +$30~50/월
효과: DB 병목 제거

쇼핑/커뮤니티 코드는 그대로,
DB 스키마만 분리해서 다른 RDS로

Backend (Spring Boot 1개)
    │
    ├── 쇼핑 관련 → shop_db (RDS-1)
    └── 커뮤니티  → community_db (RDS-2)

→ 쇼핑 DB 과부하가 커뮤니티 DB에 영향 없음
```

#### 3단계: DAU 10만 이상 — 서비스 분리 (MSA)

```
추가 비용: +$100~200/월
효과: 완전한 격리

┌──────────────┐  ┌──────────────┐  ┌──────────┐
│ 쇼핑 서비스  │  │ 커뮤니티     │  │ 인증     │
│ (Spring)     │  │ 서비스       │  │ 서비스   │
└──────────────┘  └──────────────┘  └──────────┘
       │                 │                │
   shop_db          community_db      auth_db
   (독립 RDS)       (독립 RDS)       (독립 RDS)

장점:
  쇼핑 트래픽 폭발 → 쇼핑 컨테이너만 10개로 증가
  커뮤니티는 영향 없음 → 그대로 2개

단점:
  서비스 간 통신 복잡 (HTTP API or 메시지 큐)
  배포/운영 복잡도 3배 증가
  → 팀 규모 크거나 트래픽 충분할 때만 고려
```

### MSA 언제 고려하나? 판단 기준

```
아래 중 2개 이상 해당되면 MSA 검토:

□ 특정 기능만 따로 배포하고 싶다
  (쇼핑 기능 업데이트에 전체 서버 재시작이 아깝다)

□ 팀이 기능별로 완전히 나뉘어 있다
  (쇼핑팀 5명 vs 커뮤니티팀 3명 — 코드 충돌 빈번)

□ 서비스별 트래픽 패턴이 극단적으로 다르다
  (쇼핑: 이벤트 때 100배 / 커뮤니티: 항상 일정)

□ 하나의 서비스 장애가 전체를 죽이는 일이 반복된다

해당 안 되면: 지금은 모놀리식 + Auto Scaling으로 충분
"섣부른 MSA는 모놀리식보다 나쁘다" — 실무 격언
```

---

## 7. 데이터베이스 전략

### RDS Aurora MySQL 구성

```
인스턴스: db.t3.medium (초기)
  vCPU: 2, RAM: 4GB

Multi-AZ 구성:
  Primary (AZ-a): 읽기 + 쓰기 전담
  Replica (AZ-b): 읽기 전용 + 페일오버 대기
       │
  Primary 장애 발생
       │
       ▼ (자동, 30~60초)
  Replica → Primary 자동 승격
  앱 재연결 → 정상 동작

백업:
  자동 스냅샷: 매일 새벽 3시
  보존 기간:   7일
  복구:        5분 단위 Point-in-Time Recovery 가능
```

### Read Replica 활용 (2단계부터)

```
트래픽의 80~90%는 읽기 요청
(상품 목록, 게시글 목록, 댓글 조회 등)

쓰기:  Primary DB에만 (주문, 댓글 작성, 회원가입)
읽기:  Read Replica로 분산 (목록 조회, 상세 페이지)

Spring Boot 설정:
  @Transactional(readOnly = true) → Replica로 자동 라우팅
  @Transactional                  → Primary로 자동 라우팅
```

### DB 연결 관리 주의사항

```
ECS 태스크 2개 × 연결 풀 10개 = DB에 최대 20개 연결
ECS 태스크 10개로 늘어나면  = DB에 최대 100개 연결

RDS t3.medium max_connections ≈ 170개
→ Auto Scaling으로 태스크가 늘어나면 연결 수 초과 위험

해결책: PgBouncer / RDS Proxy 사용
  앱 → RDS Proxy → RDS
  RDS Proxy가 연결 풀링 관리
  태스크 100개여도 DB 연결은 20개 유지
  비용: +$20~30/월
```

---

## 8. Redis 캐싱 전략

**캐싱 = 자주 쓰는 데이터를 빠른 곳에 미리 저장**

```
캐싱 없을 때:
  사용자 → 백엔드 → DB 쿼리 → 응답  (50~200ms)

캐싱 있을 때:
  사용자 → 백엔드 → Redis 조회 → 응답  (1~5ms)
                       └── 없으면 DB 쿼리 후 Redis에 저장
```

### 이 프로젝트에서 캐싱할 것들

```
캐싱 대상 (자주 읽히고 가끔 바뀌는 것):
  상품 목록      → TTL 5분  (재고 변경이 많지 않음)
  인기 게시글    → TTL 1분  (홈화면 위젯)
  배너 목록      → TTL 10분 (관리자가 수정 시 캐시 삭제)
  유튜브 영상    → TTL 30분
  뉴스 트렌드    → TTL 30분 (analysis 서비스 결과)

캐싱하면 안 되는 것:
  로그인 사용자별 데이터  (장바구니, 주문 내역)
  실시간 재고             (주문 시 정확한 재고 확인 필수)
  관리자 페이지 데이터    (항상 최신 데이터 필요)
```

### 캐시 전략 패턴

```
Cache-Aside 패턴 (가장 많이 씀):

1. 앱이 Redis 먼저 확인
2. 있으면 → 바로 반환 (Cache Hit)
3. 없으면 → DB에서 조회 → Redis에 저장 → 반환 (Cache Miss)
4. 데이터 변경 시 → Redis에서 해당 키 삭제

Spring Boot 코드:
  @Cacheable("products")        → 조회 시 캐싱
  @CacheEvict("products")       → 수정/삭제 시 캐시 삭제
  @CachePut("products")         → 수정 후 캐시 업데이트
```

### 캐시 주의사항 (Cache Stampede)

```
문제 상황:
  상품 목록 캐시 TTL 만료
       │
  동시에 1000명이 상품 목록 요청
       │
  전부 DB로 쿼리 몰림 → DB 과부하 → 장애

해결책: Jitter (랜덤 TTL)
  TTL을 5분 고정 → 5분 ± 30초 랜덤
  모든 캐시가 동시에 만료되지 않음

또는: 캐시 갱신을 백그라운드 스케줄러가 미리 수행
  만료 30초 전에 미리 DB 조회 → Redis 갱신
  사용자는 항상 캐시에서 응답받음
```

---

## 9. CI/CD 파이프라인

### 전체 흐름

```
개발자 로컬에서 코드 작성
       │
       ├── git push → PR 생성
       │
       ▼
[GitHub Actions: CI] ← PR 올라가면 자동 실행
  ├── Jest 테스트 (frontend)
  ├── tsc --noEmit (타입 검사)
  ├── ./gradlew test (backend)
  ├── pytest (analysis)
  └── 실패하면 → PR 머지 물리적으로 차단

       │ 전부 통과
       ▼
PR 머지 → main 브랜치
       │
       ▼
[GitHub Actions: CD Staging]
  ├── Docker 이미지 빌드 × 2 (backend, analysis)
  ├── ECR에 이미지 푸시 (태그: git SHA)
  ├── ECS Staging 자동 배포
  ├── Vercel Staging 자동 배포 (프론트 자동)
  └── Slack 알림: "Staging 배포 완료. 확인해주세요 🔍"

       │
 QA/팀장 Staging 확인
       │ 승인 버튼 클릭
       ▼
[GitHub Actions: CD Production]
  ├── ECS Production 배포 (Rolling Update)
  ├── Vercel Production 자동 반영
  └── Slack 알림: "Production 배포 완료 ✅"
```

### 왜 git SHA를 이미지 태그로 쓰나?

```
잘못된 방법:
  이미지 태그를 항상 "latest"로 사용
  → 언제 어떤 코드가 배포됐는지 추적 불가
  → 롤백 시 "latest"가 뭔지 모름

올바른 방법:
  이미지 태그 = git commit SHA (예: a3f9c12)
  → "이 이미지 = 이 커밋" 1:1 매핑
  → 문제 발생 → SHA 확인 → 해당 커밋 코드 바로 확인
  → 롤백 = 이전 SHA 태그 이미지로 ECS 업데이트
```

### 배포 전략: Rolling Update

```
컨테이너 4개 운영 중:
  [v1][v1][v1][v1]

배포 시작 (순서대로 교체):
  [v2][v1][v1][v1]  ← 1번 교체됨, 헬스체크 통과 후 다음
  [v2][v2][v1][v1]
  [v2][v2][v2][v1]
  [v2][v2][v2][v2]  ← 완료

특징:
  - 배포 중에도 서비스 무중단
  - v1/v2 동시 운영 구간 존재 (API 호환성 유지 필요)
  - 롤백: 이전 Task Definition 리비전으로 재배포 (5분)
```

### GitHub Secrets 등록 목록

```
AWS_ACCESS_KEY_ID        ← GitHub Actions용 IAM 키
AWS_SECRET_ACCESS_KEY    ← GitHub Actions용 IAM 시크릿
SLACK_WEBHOOK_URL        ← Slack 알림 웹훅
VERCEL_TOKEN             ← Vercel 배포 토큰 (자동)
```

---

## 10. 모니터링 설계

### 모니터링이 없으면 생기는 일

```
에러 발생
    │
사용자 신고 접수 (1~2시간 후)
    │
팀 인지
    │
원인 파악 시작 (이미 늦음)

모니터링 있으면:
에러 발생
    │ 1분 이내
CloudWatch 감지
    │
Slack 알림
    │
담당자가 사용자보다 먼저 앎
```

### CloudWatch 대시보드 구성

```
대시보드: analysisTrend-Operations
│
├── 행 1: 서비스 상태 (가장 중요)
│   ├── 5xx 에러율 (%) ← 0%가 정상. 올라가면 즉시 대응
│   ├── 초당 요청수 (RPS) ← 평소 대비 급변하면 확인
│   └── P99 응답시간 (ms) ← 2초 넘으면 사용자 이탈
│
├── 행 2: ECS 리소스
│   ├── Backend CPU/메모리 사용률
│   ├── Analysis CPU/메모리 사용률
│   └── 실행 중인 태스크 수 (Auto Scaling 확인)
│
├── 행 3: 데이터베이스
│   ├── RDS CPU 사용률
│   ├── RDS 동시 연결 수
│   ├── RDS 읽기/쓰기 응답시간
│   └── Replica Lag (ms) ← 0에 가까워야 함
│
├── 행 4: 캐시
│   ├── Redis 히트율 (%) ← 80% 이상 목표
│   ├── Redis 메모리 사용률
│   └── Redis 연결 수
│
└── 행 5: 비용 모니터링
    └── 일별 예상 비용 추이
```

### 알람 7개 (필수 설정)

```
알람 1: 에러율 경고
  조건: 5xx 에러 > 0.5% (5분 평균)
  알림: Slack #alert-warning
  의미: 일부 요청 실패 중. 확인 필요.

알람 2: 에러율 심각
  조건: 5xx 에러 > 2% (1분 평균)
  알림: Slack #alert-critical + 담당자 SMS
  의미: 서비스 장애 수준. 즉시 대응.

알람 3: 응답속도 저하
  조건: P99 응답시간 > 2초 (5분 평균)
  알림: Slack #alert-warning
  의미: 사용자가 느림을 체감하는 수준.

알람 4: CPU 과부하
  조건: ECS Backend CPU > 85% (3분 지속)
  알림: Slack #alert-warning
  의미: Auto Scaling 동작 중이거나 곧 동작 예정. 확인.

알람 5: DB 연결 부족
  조건: RDS 연결 수 > max_connections의 80%
  알림: Slack #alert-critical
  의미: DB 연결 포화 임박. RDS Proxy 추가 필요.

알람 6: DB 저장공간 부족
  조건: RDS 여유 공간 < 10GB
  알림: 이메일
  의미: 스토리지 확장 예약 필요.

알람 7: ECS 태스크 수 비정상
  조건: Running Task < MinCapacity
  알림: Slack #alert-critical
  의미: 컨테이너가 계속 죽는 중. 즉시 로그 확인.
```

### Slack 알람 포맷

```
🚨 [CRITICAL] analysisTrend Production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
알람명: ALB 5xx 에러율 2% 초과
현재값: 2.8%  (임계값: 2%)
발생:   2026-04-05 14:32 KST
서비스: analysistrend-backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 CloudWatch 로그 보기
👉 Runbook 보기
```

### 로그 수집 전략

```
모든 컨테이너 로그 → CloudWatch Logs → 분석/검색

JSON 포맷으로 출력 (구조화된 로그):
{
  "timestamp": "2026-04-05T14:32:00Z",
  "level": "ERROR",
  "service": "backend",
  "traceId": "abc123",    ← 요청 추적 ID
  "userId": 42,
  "message": "DB 연결 실패",
  "duration_ms": 5000
}

→ CloudWatch Logs Insights로 검색:
  에러만 모아보기, 특정 유저 요청 추적, 느린 API 찾기
```

---

## 11. 보안 설계

### 기본 원칙: 최소 권한

```
잘못된 예: GitHub Actions에 AdministratorAccess 부여
  → 키 유출 시 AWS 계정 전체 탈취 가능

올바른 예: GitHub Actions에 필요한 권한만
  - ECR: 이미지 push/pull
  - ECS: 서비스 업데이트
  - Secrets Manager: 읽기만
  - 나머지: 전부 차단
```

### Secrets Manager 활용

```
코드에 절대 넣으면 안 되는 것들:
  DB 패스워드
  JWT 시크릿 키
  OAuth2 클라이언트 시크릿
  외부 API 키 (YouTube API 등)

→ 전부 AWS Secrets Manager에 저장
→ ECS 태스크 실행 시 자동으로 환경변수로 주입
→ 코드/GitHub에는 절대 노출 안 됨

.env 파일은 로컬 개발용으로만.
절대 git에 커밋하지 말 것 (.gitignore 필수)
```

### HTTPS 강제

```
HTTP 요청 → ALB가 301 리다이렉트 → HTTPS로 전환
SSL 인증서: ACM (AWS Certificate Manager)
  - 무료
  - 자동 갱신 (Let's Encrypt 같은 개념)
  - 발급: 도메인 소유 확인 후 즉시
```

### 추가 보안 옵션 (선택)

```
WAF (Web Application Firewall): 월 $10~
  - SQL Injection, XSS 자동 차단
  - DDoS 완화
  - 봇 트래픽 차단

GuardDuty: 월 $10~
  - 이상한 접근 패턴 자동 탐지
  - "처음 보는 IP에서 DB 접근 시도" 알람

CloudTrail: 무료 (기본)
  - 모든 AWS API 호출 기록
  - "누가 언제 뭘 바꿨는지" 감사 로그
```

---

## 12. 비용 계획

### 초기 구성 (월 예상 비용)

```
서비스                     스펙                  월 비용
─────────────────────────────────────────────────────
Vercel (Frontend)          무료 플랜               $0
ECS Fargate (Backend×2)    1 vCPU, 2GB × 2태스크  $50
ECS Fargate (Analysis×1)   0.5 vCPU, 1GB × 1태스크 $10
RDS Aurora (db.t3.medium)  Multi-AZ               $80
ElastiCache (cache.t3.micro) 단일 노드             $15
ALB                        기본 요금               $20
NAT Gateway × 2            AZ-a, AZ-b             $65
Route 53                   Hosted Zone              $1
S3 + 데이터 전송            10GB/월                 $3
CloudWatch                 로그/메트릭              $5
ECR                        이미지 저장              $2
─────────────────────────────────────────────────────
합계                                            약 $251/월
```

**NAT Gateway가 비싼 이유:**
Private Subnet에서 인터넷 나갈 때마다 과금. AZ당 하나 필요.

```
NAT Gateway 비용 절감 방법:
  ECR, S3, CloudWatch → VPC Endpoint 사용 시 NAT 불필요
  → NAT 트래픽 70% 감소 → 월 $20~30 절감 가능
```

### 트래픽 증가 시 비용 변화

```
DAU 1,000명   → $250/월   (현재 구성)
DAU 10,000명  → $400/월   (RDS Read Replica 추가, ECS 태스크 증가)
DAU 100,000명 → $1,500/월 (MSA 전환, ElastiCache 클러스터 확장)
```

---

## 13. 제약사항 및 한계

### 현재 아키텍처의 한계

```
한계 1: 백엔드가 하나라서 서비스 격리 불가
  증상: 쇼핑 트래픽 폭발 → 커뮤니티도 같이 느려짐
  해결 시점: DAU 3만 이상 or 팀 규모 커질 때 MSA 전환

한계 2: 파일 업로드가 컨테이너 메모리 사용
  증상: 큰 파일 업로드 시 Analysis 컨테이너 메모리 부족
  해결: S3 Presigned URL 방식 전환 (클라이언트가 S3에 직접 업로드)

한계 3: 세션 공유가 Redis 의존
  증상: Redis 장애 시 로그인 세션 전부 끊김
  해결: JWT 방식은 이미 Stateless라 괜찮음 (확인 필요)

한계 4: Analysis 서비스 응답이 느림 (AI 처리)
  증상: 채팅 분석 30초~5분 소요 → 사용자 대기
  해결: 비동기 처리 (SQS + Lambda or Celery)
         요청 → 큐에 넣기 → 완료되면 웹소켓/폴링으로 알림

한계 5: 단일 리전
  증상: 서울 리전 전체 장애 시 서비스 불가 (극히 드문 경우)
  해결: Multi-Region은 비용/복잡도가 너무 큼 → 지금은 불필요
```

### 현재 Docker Compose와의 차이점

```
Docker Compose (지금):        AWS (이후):
  단일 서버                     Multi-AZ (2개 가용영역)
  수동 재시작                   자동 헬스체크 + 재시작
  로컬 볼륨 (이미지 저장)        S3 (무제한 확장)
  .env 파일 (보안 취약)          Secrets Manager
  모니터링 없음                  CloudWatch + 알람
  배포 = 수동 SSH               배포 = git push 자동
  HTTPS 없음 (Nginx 설정 필요)   ACM 자동 발급/갱신
  단일 장애점                    이중화 (한 서버 죽어도 유지)
```

---

## 14. 단계별 확장 로드맵

### 현재 → 1년 후

```
지금 (2026 Q2):
  Vercel + ECS (Backend+Analysis) + RDS + ElastiCache
  Auto Scaling 설정 완료
  모니터링 기본 셋업
  예상 비용: $250/월

6개월 후 (2026 Q3~Q4):
  RDS Read Replica 추가 (읽기 부하 분산)
  Redis 캐싱 본격 적용 (상품/게시글/배너)
  CloudFront → API 캐싱 추가
  RDS Proxy 도입 (연결 풀링)
  예상 비용: $350/월

1년 후 (2027 Q1~Q2):
  트래픽 보고 MSA 전환 여부 결정
  쇼핑 서비스 분리 (가장 트래픽 많을 것)
  Analysis → SQS 비동기 처리 전환
  예상 비용: $500~800/월 (트래픽 비례)
```

### MSA 전환 순서 (나중에 한다면)

```
1. 인증 서비스 먼저 분리 (가장 독립적)
2. Analysis 서비스 분리 (이미 별도 코드베이스)
3. 쇼핑 서비스 분리 (트래픽이 가장 많음)
4. 커뮤니티 서비스 분리 (가장 복잡 — 마지막)

한 번에 다 바꾸면 안 됨. 하나씩, 검증하면서.
```

### 기술 스택 업그레이드 계획

```
현재 → 미래
  Spring Boot 단일 → Spring Cloud MSA (Eureka, Gateway)
  직접 Redis 관리  → ElastiCache Cluster Mode (자동 샤딩)
  단순 CloudWatch  → Grafana + Prometheus (더 강력한 시각화)
  Rolling Update   → Blue/Green (무중단 더 확실)
  GitHub Actions   → ArgoCD (K8s GitOps)
```

---

## 15. 초기 세팅 체크리스트

### Phase 1 기반 인프라 (1~2일)

```
□ AWS 계정 생성
□ 루트 계정 MFA 설정 (필수)
□ IAM 사용자 생성
  ├── 개발팀용 (콘솔 접근)
  └── GitHub Actions용 (API 접근만, 최소 권한)
□ 서울 리전 (ap-northeast-2) 설정
□ VPC 생성 (10.0.0.0/16)
  ├── Public Subnet 2개 (AZ-a, AZ-b)
  └── Private Subnet 2개 (AZ-a, AZ-b)
□ Internet Gateway 연결 (Public용)
□ NAT Gateway 생성 (AZ-a, AZ-b 각 1개)
□ 라우팅 테이블 설정
□ 보안그룹 4개 생성 (sg-alb, sg-backend, sg-rds, sg-redis)
```

### Phase 2 데이터베이스 (반나절)

```
□ RDS Aurora MySQL 생성
  ├── 버전: MySQL 8.0 호환
  ├── 인스턴스: db.t3.medium
  ├── Multi-AZ: ON
  ├── Private Subnet 배치
  ├── 보안그룹: sg-rds
  └── 초기 DB 이름: analysis_trend
□ ElastiCache Redis 생성
  ├── 버전: Redis 7.x
  ├── 노드: cache.t3.micro (초기)
  └── Private Subnet 배치
□ Secrets Manager 등록
  ├── /analysistrend/db-password
  ├── /analysistrend/jwt-secret
  ├── /analysistrend/oauth2-google-secret
  └── /analysistrend/youtube-api-key
```

### Phase 3 컨테이너 인프라 (1일)

```
□ ECR 레포지토리 2개 생성
  ├── analysistrend-backend
  └── analysistrend-analysis
□ ECS 클러스터 생성 (Fargate 타입)
□ Task Definition 작성
  ├── backend: 1 vCPU, 2GB, 포트 8080
  └── analysis: 0.5 vCPU, 1GB, 포트 8000
□ ECS Service 생성
  ├── backend: MinCapacity 2, MaxCapacity 10
  └── analysis: MinCapacity 1, MaxCapacity 3
□ Auto Scaling 정책 설정 (CPU 60%)
□ ALB 생성
  ├── Public Subnet에 배치
  ├── Target Group 2개 (backend, analysis)
  └── 라우팅 규칙: /api/* → backend, /analysis/* → analysis
□ ACM 인증서 발급 (api.analysistrend.com)
□ Route 53 도메인 등록 및 ALB 연결
```

### Phase 4 프론트엔드 Vercel (30분)

```
□ Vercel 계정 생성
□ GitHub 레포 연결
□ 환경변수 설정
  ├── NEXT_PUBLIC_API_URL=https://api.analysistrend.com
  └── NEXT_PUBLIC_ANALYSIS_URL=https://api.analysistrend.com/analysis
□ 커스텀 도메인 연결 (analysistrend.com)
□ 첫 배포 확인
```

### Phase 5 CI/CD (반나절)

```
□ GitHub Secrets 등록
  ├── AWS_ACCESS_KEY_ID
  ├── AWS_SECRET_ACCESS_KEY
  └── SLACK_WEBHOOK_URL
□ .github/workflows/ 파일 3개 작성
  ├── ci.yml (PR 시 테스트)
  ├── cd-staging.yml (main 머지 시 Staging 자동 배포)
  └── cd-prod.yml (수동 승인 후 Production 배포)
□ GitHub Environments 설정
  └── production: Required Reviewers 지정
□ 테스트 배포 실행 및 Slack 알람 확인
```

### Phase 6 모니터링 (반나절)

```
□ CloudWatch 로그 그룹 생성
  ├── /ecs/analysistrend-backend
  └── /ecs/analysistrend-analysis
□ CloudWatch 대시보드 생성
□ 알람 7개 생성 (10번 항목 참고)
□ SNS 토픽 생성
□ Lambda 함수 생성 (SNS → Slack 포맷 변환)
□ 알람 동작 테스트 (임계값 낮춰서 트리거 확인)
□ 비용 알람 추가 (월 $300 초과 시 알림)
```

---

## 16. 장애 대응 매뉴얼 Runbook

### 장애 발생 시 첫 5분 체크리스트

```
1. CloudWatch 대시보드 열기
   └── 5xx 에러율, 응답시간, CPU 확인

2. 언제부터 생겼는지 확인
   └── 배포 시각과 에러 시작 시각 비교
   └── 일치하면 → 즉시 롤백 (아래 케이스 3 참고)

3. ECS 태스크 상태 확인
   └── AWS 콘솔 → ECS → 서비스 → Tasks 탭
   └── STOPPED 태스크 있으면 → 로그 확인

4. CloudWatch 로그에서 에러 검색
   └── /ecs/analysistrend-backend → ERROR 레벨 필터
```

### 케이스 1: ECS 태스크가 계속 죽을 때

```
증상: CloudWatch 알람 → "ECS Running Task < 2"
원인 파악:
  ECS → 서비스 → Events 탭 → 종료 이유 확인
  CloudWatch 로그 → 앱 시작 실패 로그 확인

자주 있는 원인:
  - Exit Code 1: 앱 크래시 (로그에서 에러 찾기)
  - Exit Code 137: 메모리 초과 (Task Memory 늘리기)
  - DB 연결 실패: 보안그룹, Secrets Manager 확인
  - 환경변수 없음: Task Definition 환경변수 확인

해결:
  메모리: Task Definition 수정 (2GB → 4GB) 후 재배포
  코드 에러: 핫픽스 PR → 빠른 배포 or 이전 버전 롤백
```

### 케이스 2: DB 연결 오류

```
증상: 백엔드 로그에 "Communications link failure" 반복
원인 파악:
  1. RDS 콘솔 → 인스턴스 상태 확인 (Available?)
  2. CloudWatch → DatabaseConnections 메트릭 확인
  3. 보안그룹 확인 (sg-backend → sg-rds 3306 허용?)

해결:
  RDS 장애 → Multi-AZ Failover 진행 중 (30~60초 대기)
  연결 수 초과 → 앱 connection pool 크기 줄이기
  보안그룹 문제 → 규칙 추가

수동 Failover 방법:
  RDS 콘솔 → 인스턴스 선택 → Actions → Failover
```

### 케이스 3: 배포 후 에러율 급증 → 롤백

```
증상: 배포 직후 5xx 에러율 급증

즉각 롤백 (5분 이내 목표):

# 이전 Task Definition 리비전 확인
aws ecs describe-services \
  --cluster analysistrend-cluster \
  --services analysistrend-backend \
  --query 'services[0].taskDefinition'

# 이전 리비전으로 롤백 (예: :42 → :41)
aws ecs update-service \
  --cluster analysistrend-cluster \
  --service analysistrend-backend \
  --task-definition analysistrend-backend:41

# 2~3분 후 에러율 정상화 확인
# Slack: "롤백 완료. 원인 파악 중..."
```

### 케이스 4: 트래픽 폭발 (쇼핑 이벤트 등)

```
증상: CPU 90%+, 응답시간 급증, Auto Scaling 동작 중

Auto Scaling이 자동 대응 중 (1~3분):
  → 컨테이너 자동 추가
  → 보통 5분 내 정상화

자동 대응 안 될 때 수동 조치:
  ECS 서비스 → 원하는 태스크 수 직접 올리기
  aws ecs update-service \
    --cluster analysistrend-cluster \
    --service analysistrend-backend \
    --desired-count 8  ← 즉시 8개로 증가

Redis 캐싱이 있다면:
  → 상품 목록 조회는 캐시에서 처리
  → DB 부하 대폭 감소
  → Auto Scaling 없어도 버틸 수 있음
```

---

## 참고: 현재 docker-compose와 AWS 대응표

| docker-compose 서비스 | AWS 서비스 | 비고 |
|----------------------|-----------|------|
| nginx | ALB + Vercel | 라우팅/프록시 역할 |
| frontend (Next.js) | Vercel | git push 자동 배포 |
| backend (Spring) | ECS Fargate | 최소 2 태스크 |
| analysis (FastAPI) | ECS Fargate | 최소 1 태스크 |
| mysql | RDS Aurora Multi-AZ | 자동 페일오버 |
| redis | ElastiCache | 관리형 서비스 |
| 로컬 파일 볼륨 | S3 | 이미지/파일 |
| .env 파일 | Secrets Manager | 보안 강화 |
| 없음 | CloudWatch | 로그/메트릭/알람 |
| 없음 | Auto Scaling | 자동 서버 증감 |
| 없음 | ACM | SSL 자동 관리 |
| 없음 | WAF | 선택사항 |
