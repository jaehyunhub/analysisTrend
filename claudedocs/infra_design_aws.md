# analysisTrend — AWS 인프라 설계서

> 대상 독자: 인프라 입문 엔지니어
> 작성일: 2026-04-05
> 목표: "이 문서 하나만 보고 AWS에 올릴 수 있다"

---

## 0. 이 문서를 읽기 전에 알아야 할 개념 3가지

### 가용영역(AZ, Availability Zone)이란?
AWS는 전 세계에 **리전(Region)**이 있고, 리전 안에 **가용영역**이 여러 개 있다.
가용영역은 **물리적으로 분리된 데이터센터**라고 생각하면 된다.

```
서울 리전 (ap-northeast-2)
├── AZ-a (서울 데이터센터 A동)
├── AZ-b (서울 데이터센터 B동)  ← 화재/정전이 나도 B, C는 살아있음
└── AZ-c (서울 데이터센터 C동)
```

### 왜 Multi-AZ가 중요한가?
- 서버 1대: AZ-a가 죽으면 서비스 전체 다운 → **단일 장애점(SPOF)**
- Multi-AZ: AZ-a가 죽어도 AZ-b, AZ-c로 자동 전환 → **고가용성(HA)**

### 컨테이너 vs 서버
- **EC2**: 가상 서버(VM). 직접 SSH 접속해서 설치/관리. 관리 부담 있음.
- **ECS Fargate**: 컨테이너만 올리면 서버 관리는 AWS가 함. 권장.
- **EKS**: Kubernetes. 대규모일 때. 초기엔 오버엔지니어링.

---

## 1. 전체 아키텍처 다이어그램

```
[사용자 브라우저]
       │ HTTPS
       ▼
[Route 53] ── DNS 쿼리 → IP 반환
       │
       ▼
[CloudFront] ── 정적 자산 캐시 (JS/CSS/이미지)
       │         └── S3 버킷 (정적 파일 origin)
       │ 동적 요청
       ▼
[ACM] ── SSL/TLS 인증서 자동 발급/갱신
       │
       ▼
[ALB: Application Load Balancer]
  ap-northeast-2 / Multi-AZ
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
[ECS Fargate: frontend]             [ECS Fargate: backend]
  Next.js :3000                      Spring Boot :8080
  태스크 최소 2개 (AZ-a, AZ-b)        태스크 최소 2개 (AZ-a, AZ-b)
  Auto Scaling (CPU 60% 기준)         Auto Scaling (CPU 60% 기준)
       │                                     │
       │                          [ECS Fargate: analysis]
       │                           FastAPI :8000
       │                           태스크 최소 1개
       │                                     │
       └──────────────┬──────────────────────┘
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
[RDS Aurora MySQL]         [ElastiCache Redis]
  Multi-AZ (자동 페일오버)    클러스터 모드
  Primary (AZ-a)              (캐시 / 세션)
  Replica (AZ-b) ← 읽기 분산
          │
          ▼
[S3] ── 이미지/파일 업로드 저장소
[ECR] ── Docker 이미지 레지스트리
[Secrets Manager] ── DB 패스워드, JWT 시크릿 등
[CloudWatch] ── 로그, 메트릭, 알람
[SNS + Lambda] ── 알람 → Slack 연동
```

---

## 2. AWS 서비스별 역할 설명

| 서비스 | 역할 | 왜 이걸 쓰나 |
|--------|------|-------------|
| **Route 53** | DNS 서비스. `analysistrend.com` → IP 변환 | AWS 통합, 헬스체크 자동 장애조치 |
| **CloudFront** | CDN. 전 세계 엣지 서버에서 정적 자산 제공 | 로딩 속도 향상, DDoS 방어, HTTPS 강제 |
| **ACM** | SSL 인증서 발급/자동 갱신 | 무료, 자동 갱신 (Let's Encrypt 대체) |
| **ALB** | 트래픽을 여러 컨테이너로 분산 | 헬스체크, 경로 기반 라우팅 (`/api/*` → backend) |
| **ECS Fargate** | 컨테이너 실행 (서버리스) | EC2 관리 불필요, 자동 스케일링 |
| **ECR** | Docker 이미지 저장소 | CI/CD 파이프라인과 통합 |
| **RDS Aurora** | MySQL 호환 관계형 DB | 자동 Multi-AZ, Replica 자동 페일오버 |
| **ElastiCache** | Redis 관리형 서비스 | 세션, 캐시. 직접 Redis 운영 불필요 |
| **S3** | 파일/이미지 오브젝트 스토리지 | 무제한 확장, 99.99% 내구성 |
| **Secrets Manager** | 민감정보 관리 | 코드에 패스워드 하드코딩 방지 |
| **CloudWatch** | 로그 수집, 메트릭, 알람 | AWS 기본 제공, 별도 설치 불필요 |
| **SNS** | 알람 메시지 발송 (Slack/이메일) | CloudWatch 알람과 연동 |

---

## 3. 네트워크 구성 (VPC 설계)

**VPC = 우리만의 가상 사설 네트워크**. 외부에서 직접 접근 불가.

```
VPC: 10.0.0.0/16
│
├── Public Subnet (인터넷에서 직접 접근 가능)
│   ├── 10.0.1.0/24 (AZ-a) ── ALB 배치
│   └── 10.0.2.0/24 (AZ-b) ── ALB 배치
│
└── Private Subnet (인터넷에서 직접 접근 불가 ← 보안)
    ├── 10.0.11.0/24 (AZ-a) ── ECS 컨테이너, RDS Primary
    └── 10.0.12.0/24 (AZ-b) ── ECS 컨테이너, RDS Replica
```

**포인트**:
- ALB만 Public에 노출, 컨테이너/DB는 모두 Private
- Private Subnet의 컨테이너가 인터넷에 나가려면 **NAT Gateway** 경유
- 보안그룹(Security Group): ALB → ECS 포트만 열기, ECS → RDS 포트만 열기

### 보안그룹 설정 예시

```
sg-alb (ALB용)
  Inbound:  80, 443 from 0.0.0.0/0 (인터넷 전체)
  Outbound: 3000 to sg-frontend
            8080 to sg-backend

sg-frontend (Next.js 컨테이너)
  Inbound:  3000 from sg-alb only  ← ALB에서만 접근 가능
  Outbound: 8080 to sg-backend, 443 to 0.0.0.0/0

sg-backend (Spring Boot 컨테이너)
  Inbound:  8080 from sg-alb, sg-frontend
  Outbound: 3306 to sg-rds, 6379 to sg-redis

sg-rds (RDS)
  Inbound:  3306 from sg-backend only ← 백엔드에서만 접근

sg-redis (ElastiCache)
  Inbound:  6379 from sg-backend only
```

---

## 4. ALB 라우팅 규칙

현재 Nginx가 하는 역할을 ALB가 대체한다.

```
ALB Listener: 443 (HTTPS)
│
├── /api/*       → backend Target Group (Spring Boot :8080)
├── /oauth2/*    → backend Target Group
├── /analysis/*  → analysis Target Group (FastAPI :8000)
└── /*           → frontend Target Group (Next.js :3000)
```

**Target Group 헬스체크 설정**:
```
frontend: GET / → 200 응답 확인 (10초 간격)
backend:  GET /actuator/health → 200 응답 확인
analysis: GET /health → 200 응답 확인
```
헬스체크 2회 실패 시 해당 태스크 자동 제외 → 트래픽 다른 태스크로 이동

---

## 5. ECS Task Definition (컨테이너 설정)

Task Definition = "이 컨테이너를 어떻게 실행할지" 명세서

### frontend (Next.js)
```json
{
  "family": "analysistrend-frontend",
  "cpu": "512",
  "memory": "1024",
  "networkMode": "awsvpc",
  "containerDefinitions": [{
    "name": "frontend",
    "image": "123456789.dkr.ecr.ap-northeast-2.amazonaws.com/frontend:latest",
    "portMappings": [{"containerPort": 3000}],
    "environment": [
      {"name": "NEXT_PUBLIC_API_URL", "value": "https://api.analysistrend.com"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/analysistrend-frontend",
        "awslogs-region": "ap-northeast-2",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
```

### backend (Spring Boot)
```json
{
  "family": "analysistrend-backend",
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [{
    "name": "backend",
    "image": "123456789.dkr.ecr.ap-northeast-2.amazonaws.com/backend:latest",
    "portMappings": [{"containerPort": 8080}],
    "secrets": [
      {"name": "SPRING_DATASOURCE_PASSWORD",
       "valueFrom": "arn:aws:secretsmanager:...:db-password"},
      {"name": "JWT_SECRET",
       "valueFrom": "arn:aws:secretsmanager:...:jwt-secret"}
    ],
    "environment": [
      {"name": "SPRING_DATASOURCE_URL",
       "value": "jdbc:mysql://rds-endpoint:3306/analysis_trend"},
      {"name": "SPRING_REDIS_HOST", "value": "redis-endpoint"}
    ]
  }]
}
```

---

## 6. Auto Scaling 설정

**언제 스케일 아웃(늘리나)?**
- CPU 사용률 60% 이상 → 새 태스크 추가
- 메모리 사용률 80% 이상 → 새 태스크 추가

**언제 스케일 인(줄이나)?**
- CPU 사용률 20% 이하 5분 지속 → 태스크 제거

```
Service: analysistrend-backend
  MinCapacity: 2  ← 최소 2개 (AZ-a, AZ-b 각 1개)
  MaxCapacity: 10 ← 최대 10개까지 자동 확장
  ScalingPolicy:
    - CPU Target 60%
    - ScaleOut cooldown: 60초 (너무 빠른 확장 방지)
    - ScaleIn cooldown: 300초 (너무 빠른 축소 방지)
```

---

## 7. CI/CD 파이프라인 — GitHub Actions

### 전체 흐름

```
개발자 로컬
  │
  ├── git push origin feature/xxx
  │         │
  │    [GitHub Actions: CI]
  │    ├── Jest (frontend)
  │    ├── tsc --noEmit (타입 검사)
  │    ├── ./gradlew test (backend)
  │    ├── pytest (analysis)
  │    └── 실패 시 → PR 머지 차단
  │
  └── PR → main 머지
              │
         [GitHub Actions: CD]
         ├── Docker build × 3 (frontend/backend/analysis)
         ├── ECR push (태그: git SHA)
         ├── ECS Task Definition 업데이트
         ├── ECS Staging 자동 배포
         │         │
         │    Slack: "Staging 배포 완료 — 확인 부탁드립니다"
         │         │
         │    (수동 승인 — GitHub Environments)
         │         │
         └── ECS Production 배포 (Rolling Update)
                   │
              Slack: "Production 배포 완료 ✅"
```

### GitHub Actions 파일 구조

```
.github/
└── workflows/
    ├── ci.yml          ← PR 시 자동 실행 (테스트)
    ├── cd-staging.yml  ← main 머지 시 Staging 자동 배포
    └── cd-prod.yml     ← 수동 승인 후 Production 배포
```

### ci.yml (테스트 파이프라인)

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && node_modules/.bin/tsc --noEmit
      - run: cd frontend && npm test -- --passWithNoTests

  backend-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: analysis_trend_test
        ports: ['3306:3306']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'
      - run: cd backend && ./gradlew test

  analysis-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: cd analysis && pip install -r requirements.txt
      - run: cd analysis && pytest tests/ -v
```

### cd-staging.yml (Staging 자동 배포)

```yaml
name: CD — Staging

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-northeast-2
  ECR_REGISTRY: 123456789.dkr.ecr.ap-northeast-2.amazonaws.com

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # AWS 인증 (GitHub Secrets에 저장된 키 사용)
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # ECR 로그인
      - uses: aws-actions/amazon-ecr-login@v2

      # 이미지 빌드 & 푸시 (태그: git SHA 사용 → 롤백 가능)
      - name: Build & Push frontend
        run: |
          docker build -t $ECR_REGISTRY/frontend:${{ github.sha }} ./frontend
          docker push $ECR_REGISTRY/frontend:${{ github.sha }}

      - name: Build & Push backend
        run: |
          docker build -t $ECR_REGISTRY/backend:${{ github.sha }} ./backend
          docker push $ECR_REGISTRY/backend:${{ github.sha }}

      - name: Build & Push analysis
        run: |
          docker build -t $ECR_REGISTRY/analysis:${{ github.sha }} ./analysis
          docker push $ECR_REGISTRY/analysis:${{ github.sha }}

      # ECS Task Definition 이미지 태그 업데이트
      - name: Update ECS Task Definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: .aws/task-definition-staging.json
          container-name: frontend
          image: ${{ env.ECR_REGISTRY }}/frontend:${{ github.sha }}

      # ECS 서비스 배포
      - name: Deploy to ECS Staging
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: analysistrend-staging
          cluster: analysistrend-cluster
          wait-for-service-stability: true  # 배포 완료까지 대기

      # Slack 알림
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "Staging 배포 완료 — ${{ github.sha }} by ${{ github.actor }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### cd-prod.yml (Production 수동 승인 배포)

```yaml
name: CD — Production

on:
  workflow_dispatch:  # 수동 실행만 (버튼 클릭)
    inputs:
      image_tag:
        description: '배포할 이미지 태그 (git SHA)'
        required: true

# GitHub Environments "production" 설정에서
# Required Reviewers 지정 → 승인자가 OK 눌러야 실행
environment: production

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - name: Deploy to Production
        run: |
          aws ecs update-service \
            --cluster analysistrend-cluster \
            --service analysistrend-prod \
            --force-new-deployment

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          text: "🚀 Production 배포 완료 — ${{ github.event.inputs.image_tag }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 8. 롤백 전략

배포 후 에러 발생 시 즉각 대응.

### 방법 1: ECS 이전 Task Definition으로 롤백

```bash
# 현재 실행 중인 Task Definition 리비전 확인
aws ecs describe-services \
  --cluster analysistrend-cluster \
  --services analysistrend-prod \
  --query 'services[0].taskDefinition'

# 이전 리비전으로 강제 배포 (예: revision 42 → 41)
aws ecs update-service \
  --cluster analysistrend-cluster \
  --service analysistrend-prod \
  --task-definition analysistrend-backend:41  # ← 이전 버전 번호
```

### 방법 2: GitHub Actions에서 특정 SHA 재배포

```bash
# Staging에서 검증됐던 SHA로 Production 수동 배포
# workflow_dispatch → image_tag 입력창에 SHA 입력
```

### 롤백 의사결정 기준

```
배포 후 10분 이내 체크:
  ├── 에러율 > 1%    → 즉시 롤백
  ├── P99 응답시간 > 3초 → 즉시 롤백
  ├── CPU > 90% 지속 → 롤백 검토
  └── 정상           → 모니터링 30분 더
```

---

## 9. 모니터링 설계

### 3가지 황금 지표 (Google SRE 기준)

| 지표 | 설명 | 임계값 |
|------|------|--------|
| **Latency (응답속도)** | P99 응답시간 | > 2초 → 경고, > 5초 → 긴급 |
| **Error Rate (에러율)** | 5xx 응답 비율 | > 0.1% → 경고, > 1% → 긴급 |
| **Traffic (트래픽)** | RPS (초당 요청수) | 급격한 변화 → 확인 필요 |

### CloudWatch 대시보드 구성

```
대시보드: analysisTrend-Operations
│
├── [행 1] 서비스 헬스 요약
│   ├── ALB 5xx 에러율 (%)
│   ├── ALB 요청/초 (RPS)
│   └── ALB 평균 응답시간 (ms)
│
├── [행 2] ECS 리소스
│   ├── Frontend CPU/Memory 사용률
│   ├── Backend CPU/Memory 사용률
│   └── Analysis CPU/Memory 사용률
│
├── [행 3] 데이터베이스
│   ├── RDS CPU 사용률
│   ├── RDS 연결 수
│   ├── RDS 읽기/쓰기 IOPS
│   └── RDS Replication Lag (ms) ← 0에 가까워야 함
│
├── [행 4] 캐시
│   ├── ElastiCache 히트율 (%) ← 80% 이상 목표
│   ├── ElastiCache 연결 수
│   └── ElastiCache 메모리 사용률
│
└── [행 5] 애플리케이션 로그
    ├── ERROR 로그 카운트 (1분 집계)
    └── 최근 에러 로그 목록
```

### CloudWatch 알람 설정

```
알람 1: 에러율 경고
  조건: ALB 5xx > 전체의 0.5% (5분 평균)
  액션: SNS → Slack #alert-warning

알람 2: 에러율 긴급
  조건: ALB 5xx > 전체의 2% (1분 평균)
  액션: SNS → Slack #alert-critical + 담당자 SMS

알람 3: 응답시간 경고
  조건: ALB P99 > 2000ms (5분 평균)
  액션: SNS → Slack #alert-warning

알람 4: CPU 과부하
  조건: ECS Backend CPU > 85% (3분 지속)
  액션: SNS → Slack (Auto Scaling이 먼저 동작하는지 확인)

알람 5: DB 연결 과부하
  조건: RDS DatabaseConnections > 80% of max_connections
  액션: SNS → Slack #alert-critical

알람 6: 디스크 부족
  조건: RDS FreeStorageSpace < 10GB
  액션: SNS → 이메일 알림

알람 7: ECS 태스크 수 감소
  조건: Running Task Count < MinCapacity
  액션: SNS → Slack #alert-critical (서비스 이상 가능성)
```

### Slack 알람 포맷 (Lambda로 가공)

```
🚨 [CRITICAL] analysisTrend Production
━━━━━━━━━━━━━━━━━━━━━━━━━━
알람: ALB 5xx 에러율 2.3% 초과
현재값: 2.3% (임계값: 2%)
시작: 2026-04-05 14:32:00 KST
서비스: analysistrend-backend
━━━━━━━━━━━━━━━━━━━━━━━━━━
[CloudWatch 바로가기] [Runbook 보기]
```

### 로그 구조 (애플리케이션에서 JSON 포맷 출력)

```json
// Spring Boot 로그 포맷 (logback-spring.xml)
{
  "timestamp": "2026-04-05T14:32:00.000Z",
  "level": "ERROR",
  "service": "backend",
  "traceId": "abc123",   ← 요청 추적 ID (frontend-backend-analysis 연결)
  "userId": 42,
  "message": "DB 연결 실패",
  "exception": "com.mysql.jdbc.exceptions.jdbc4.CommunicationsException"
}
```

**CloudWatch Logs Insights 쿼리 예시**:
```sql
-- 최근 1시간 에러 집계
fields @timestamp, level, message, userId
| filter level = "ERROR"
| stats count(*) as errorCount by message
| sort errorCount desc
| limit 20
```

---

## 10. 데이터베이스 설계

### RDS Aurora MySQL 설정

```
인스턴스: db.r6g.large (운영 초기)
  ├── vCPU: 2
  ├── RAM: 16GB
  └── 스토리지: 자동 확장 (20GB ~ 128TB)

Multi-AZ: 활성화
  ├── Primary (AZ-a): 읽기/쓰기
  └── Replica (AZ-b): 읽기 전용 + 페일오버 대기
      └── Primary 장애 시 약 30초 내 자동 승격

백업:
  ├── 자동 스냅샷: 매일 새벽 3시 (서울 시간)
  ├── 보존 기간: 7일
  └── Point-In-Time Recovery: 5분 단위 복구 가능
```

### 연결 설정 (Spring Boot)

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://${RDS_ENDPOINT}:3306/analysis_trend
         ?useSSL=true
         &characterEncoding=UTF-8
         &serverTimezone=Asia/Seoul
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}  # Secrets Manager에서 주입
  jpa:
    properties:
      hibernate:
        connection:
          pool_size: 10        # 컨테이너당 최대 연결 수
```

> 주의: ECS 태스크 2개 × 연결 10개 = DB에 최대 20개 연결
> RDS 최대 연결 수(max_connections) 초과하면 연결 거부 → 알람 필수

---

## 11. 비용 예측 (월 기준, 서울 리전)

### 최소 운영 구성 (소규모 트래픽)

| 서비스 | 스펙 | 월 비용 |
|--------|------|---------|
| ECS Fargate (frontend × 2) | 0.5 vCPU, 1GB | ~$15 |
| ECS Fargate (backend × 2) | 1 vCPU, 2GB | ~$50 |
| ECS Fargate (analysis × 1) | 0.5 vCPU, 1GB | ~$8 |
| RDS Aurora (db.t3.medium) | Multi-AZ | ~$80 |
| ElastiCache (cache.t3.micro) | 단일 노드 | ~$15 |
| ALB | 기본 요금 | ~$20 |
| CloudFront | 10GB/월 | ~$3 |
| Route 53 | Hosted Zone | ~$1 |
| NAT Gateway | 2개 (AZ-a, b) | ~$65 |
| **합계** | | **~$257/월** |

> NAT Gateway가 비싼 이유: Private Subnet → 인터넷 통신마다 과금
> 절감 방법: VPC Endpoint 사용 (ECR, S3, CloudWatch는 VPC 내 통신)

### 트래픽 증가 시 스케일업 포인트

```
DAU 1,000명  → 현재 구성으로 충분
DAU 10,000명 → backend 태스크 4개, RDS Read Replica 추가
DAU 100,000명 → RDS 샤딩 검토, CDN 캐시 비율 최대화
```

---

## 12. 초기 세팅 순서 (체크리스트)

### Phase 1: 기반 인프라 (1~2일)

```
□ AWS 계정 생성 + MFA 설정
□ IAM 사용자 생성 (GitHub Actions용 — 최소 권한)
  └── 권한: ECR 풀/푸시, ECS 배포, Secrets Manager 읽기
□ VPC 생성 (10.0.0.0/16)
  ├── Public Subnet × 2 (AZ-a, AZ-b)
  └── Private Subnet × 2 (AZ-a, AZ-b)
□ NAT Gateway 생성 (AZ-a, AZ-b 각 1개)
□ 보안그룹 4개 생성 (alb, frontend, backend, rds)
```

### Phase 2: 데이터베이스 & 캐시 (반나절)

```
□ RDS Aurora MySQL 생성
  ├── Multi-AZ: ON
  ├── Private Subnet에 배치
  └── 파라미터 그룹: character_set_server=utf8mb4
□ ElastiCache Redis 생성
  ├── Private Subnet에 배치
  └── 버전: Redis 7.x
□ Secrets Manager에 민감정보 저장
  ├── DB 패스워드
  ├── JWT 시크릿
  └── OAuth2 클라이언트 시크릿
```

### Phase 3: 컨테이너 인프라 (1일)

```
□ ECR 레포지토리 3개 생성 (frontend, backend, analysis)
□ ECS 클러스터 생성 (Fargate 타입)
□ Task Definition 작성 (3개)
□ ECS Service 생성 (frontend, backend, analysis)
□ ALB 생성 + Target Group + 라우팅 규칙 설정
□ ACM 인증서 발급 (도메인 검증)
□ Route 53 도메인 설정
□ CloudFront 배포 생성
```

### Phase 4: CI/CD 파이프라인 (반나절)

```
□ GitHub Secrets 등록
  ├── AWS_ACCESS_KEY_ID
  ├── AWS_SECRET_ACCESS_KEY
  └── SLACK_WEBHOOK_URL
□ .github/workflows/ 파일 작성 (ci.yml, cd-staging.yml, cd-prod.yml)
□ GitHub Environments 설정
  └── production: Required Reviewers 지정
□ 첫 배포 테스트
```

### Phase 5: 모니터링 (반나절)

```
□ CloudWatch 로그 그룹 생성 (서비스별)
□ CloudWatch 대시보드 생성
□ CloudWatch 알람 7개 생성
□ SNS 토픽 생성 + Slack Lambda 연결
□ 알람 동작 테스트 (임계값 일시 조정 후 확인)
```

---

## 13. 운영 Runbook (장애 대응 매뉴얼)

### 장애 유형별 대응

#### 케이스 1: ECS 태스크 계속 재시작됨

```
증상: CloudWatch에서 Task 상태가 RUNNING → STOPPED 반복
원인 파악:
  1. ECS 서비스 이벤트 확인
     → AWS 콘솔 ECS → 서비스 → Events 탭
  2. CloudWatch 로그 확인
     → /ecs/analysistrend-backend 로그 그룹
  3. 태스크 종료 코드 확인
     → Exit Code 1: 앱 크래시 (로그 확인)
     → Exit Code 137: OOM (메모리 부족 → Task 메모리 증가)

해결:
  - 앱 에러: 코드 수정 후 재배포
  - 메모리 부족: Task Definition 메모리 값 증가 후 배포
  - DB 연결 실패: RDS 보안그룹, Secrets Manager 확인
```

#### 케이스 2: DB 연결 오류

```
증상: 백엔드 로그에 "Connection refused" 또는 "Too many connections"
원인 파악:
  1. RDS 상태 확인: AWS 콘솔 RDS → 인스턴스 상태
  2. 연결 수 확인: CloudWatch → DatabaseConnections 메트릭
  3. 보안그룹 확인: backend SG → RDS SG 3306 허용 여부

해결:
  - 연결 수 초과: 앱 connection pool 설정 줄이기 or RDS 스케일업
  - RDS 장애: Multi-AZ Failover 자동 진행 중 (약 30초 대기)
  - 수동 페일오버: RDS 콘솔 → "Failover" 버튼
```

#### 케이스 3: 배포 후 에러율 급증

```
증상: CloudWatch 알람 → Slack "5xx 에러율 2% 초과"
즉각 대응 (5분 이내):
  1. 직전 배포가 원인인지 확인
     → ECS 서비스 이벤트에서 배포 시각 확인
     → 에러율 급증 시각과 일치하면 → 즉시 롤백
  2. 롤백 실행
     aws ecs update-service \
       --cluster analysistrend-cluster \
       --service analysistrend-prod \
       --task-definition analysistrend-backend:[이전 리비전 번호]
  3. 에러율 정상화 확인 (2~3분 후)
  4. 원인 분석 후 핫픽스 배포
```

---

## 14. 보안 체크리스트

```
□ 루트 계정 사용 금지 (IAM 사용자만 사용)
□ MFA 전 계정 활성화
□ IAM 최소 권한 원칙 (GitHub Actions 전용 키는 배포 권한만)
□ 모든 S3 버킷 Public 접근 차단
□ RDS 퍼블릭 엔드포인트 비활성화
□ SSL/TLS 강제 (HTTP → HTTPS 리다이렉트)
□ WAF (Web Application Firewall) 연결 (선택사항)
□ CloudTrail 활성화 (모든 API 호출 감사 로그)
□ GuardDuty 활성화 (이상 행위 자동 탐지)
□ 정기 보안 패치: ECR 이미지 취약점 스캔 (ECR Enhanced Scanning)
```

---

## 참고: 현재 docker-compose vs AWS 대응표

| docker-compose | AWS |
|----------------|-----|
| `nginx` | ALB + CloudFront |
| `frontend` 컨테이너 | ECS Fargate (frontend 서비스) |
| `backend` 컨테이너 | ECS Fargate (backend 서비스) |
| `analysis` 컨테이너 | ECS Fargate (analysis 서비스) |
| `mysql` 컨테이너 | RDS Aurora MySQL |
| `redis` 컨테이너 | ElastiCache Redis |
| 로컬 볼륨 (이미지) | S3 |
| `.env` 파일 | Secrets Manager + Systems Manager Parameter Store |
| 없음 | CloudWatch (로그/메트릭) |
| 없음 | ALB 헬스체크 + Auto Scaling |
