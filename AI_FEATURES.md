# AI 기능 상세 명세 (Phase 2)

> 관련 문서: [PRD.md](./PRD.md) § 9 Phase 2 | [SPEC.md](./SPEC.md) Phase 11
> 작성일: 2026-03-19

---

## 개요

Phase 2에서 구현 예정인 AI 연동 기능 5가지의 도구 선택 근거, 작동 방식, 비용 구조를 정리합니다.

| 기능 ID | 기능명 | AI 도구 | 모델 | 비용 수준 |
|---------|--------|---------|------|---------|
| TRD-03 | 뉴스 원문 3줄 요약 | **Claude API** | `claude-haiku-4-5` | 매우 낮음 ($0.0001/건) |
| TRD-04 | 키워드 시계열 차트 | **없음** (Recharts) | — | 무료 |
| TRD-06 | AI 콘텐츠 제안 | **Claude API** | `claude-sonnet-4-6` | 낮음 ($0.01~0.02/회) |
| ANA-04 | 썸네일 CTR 분석 | **GPT-4o Vision** | `gpt-4o` | 중간 ($0.005/이미지) |
| ANA-05 | 최적 업로드 시간 추천 | **없음** (scikit-learn) | — | 무료 |

---

## TRD-03 — 뉴스 원문 링크 + 3줄 요약

### 도구: Claude API (`claude-haiku-4-5`)

**선택 이유**: 텍스트 요약에 특화, 가장 저렴한 Claude 모델로 비용 최소화. 기사 1만 건 처리 시 $1 수준.

### 현재 파이프라인

```
Naver News API → 제목·발행일·URL 수집 → Redis "news_keywords" 저장
```

### 추가할 파이프라인

```
URL 목록
  → httpx 비동기 크롤링 (원문 본문 추출)
  → Redis 캐시 확인 (key: news_summary:{article_hash})
  → 캐시 miss → Claude API 호출
  → Redis 저장 (TTL: 24시간)
  → GET /trends/news 응답에 summary 필드 추가
```

### 구현 위치: `analysis/services/news_collector.py`

```python
import anthropic
import hashlib
from redis.asyncio import Redis

client = anthropic.AsyncAnthropic()

async def summarize_article(article_text: str, redis: Redis) -> str:
    cache_key = f"news_summary:{hashlib.md5(article_text[:200].encode()).hexdigest()}"

    # 캐시 확인 (24시간 TTL — LLM 비용 절감)
    cached = await redis.get(cache_key)
    if cached:
        return cached.decode()

    msg = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": (
                "다음 뉴스 기사를 핵심 사실 중심으로 3줄로 요약해주세요. "
                "각 줄은 '•'로 시작하고, 숫자·날짜·인물명을 포함해 구체적으로 작성하세요.\n\n"
                f"{article_text[:3000]}"
            )
        }]
    )
    summary = msg.content[0].text
    await redis.setex(cache_key, 86400, summary)  # TTL 24시간
    return summary
```

### API 응답 변경

```json
// 기존
{ "keyword": "AI", "score": 1.0, "source": "naver_news" }

// 추가 후
{
  "keyword": "AI",
  "score": 1.0,
  "source": "naver_news",
  "articles": [
    {
      "title": "삼성, AI 반도체 투자 10조 확대",
      "url": "https://news.naver.com/...",
      "published_at": "2026-03-19T09:00:00Z",
      "summary": "• 삼성전자가 2026년 AI 반도체 R&D 예산을 전년 대비 40% 늘린 10조원으로 확정했다.\n• 주요 투자 대상은 HBM4 메모리와 파운드리 2나노 공정이다.\n• 엔비디아·AMD와의 공급 계약 확대가 배경으로 작용했다."
    }
  ]
}
```

### 비용 구조

| 항목 | 수치 |
|------|------|
| 모델 | claude-haiku-4-5 |
| 입력 단가 | $0.80 / 1M tokens |
| 출력 단가 | $4.00 / 1M tokens |
| 기사당 입력 | ~750 tokens (3000자) |
| 기사당 출력 | ~100 tokens |
| **기사당 비용** | **~$0.0010** |
| Redis 24h 캐시 효과 | 반복 조회 시 $0 |
| 일 30건 처리 시 | ~$0.03/일 |

---

## TRD-04 — 키워드 시계열 추이 차트

### 도구: 없음 (Redis + Recharts)

**AI 불필요**. 이미 설치된 인프라(Redis, Recharts)만으로 구현 가능.

### 현재 문제점

```
Redis key "news_keywords" → 30분마다 덮어씀 → 히스토리 없음
```

### 해결 방법

```
1. Redis List에 타임스탬프와 함께 append
   LPUSH news_keywords_history {ts, keywords: [{keyword, score}]}
   LTRIM news_keywords_history 0 47  → 최근 48개 (24시간치) 유지

2. GET /trends/news/history → 시계열 배열 반환

3. 프론트엔드 Recharts <LineChart>
   x축: 시간 레이블 (30분 간격)
   y축: keyword score (0.0 ~ 1.0)
   각 키워드 = 하나의 <Line stroke={color} />
   상위 5개 키워드만 표시 (범례 토글)
```

### 구현 위치

- `analysis/tasks/scheduler.py` — 30분 주기 실행 시 히스토리 append 추가
- `analysis/routers/trends.py` — `GET /trends/news/history` 엔드포인트 추가
- `frontend/src/app/admin/trends/_content.tsx` — "뉴스 원문" 탭 → "시계열" 탭 추가

---

## TRD-06 — AI 콘텐츠 제안 카드

### 도구: Claude API (`claude-sonnet-4-6`)

**선택 이유**: 트렌딩 키워드와 채널 맥락을 결합한 창의적 기획 제안 → 단순 요약보다 높은 추론 능력 필요. claude-sonnet-4-6이 품질·비용 균형에 최적.

### 입력 데이터 수집

```
① Redis "news_keywords" → 트렌딩 키워드 TOP 10 (score 포함)
② YouTube Data API "playlistItems" → 채널 최근 영상 제목 10개
③ (선택) YouTube Analytics → 최근 30일 조회수 상위 영상 3개
```

### Claude API 호출

```python
async def generate_content_suggestions(
    keywords: list[str],
    recent_titles: list[str],
    redis: Redis
) -> list[dict]:
    cache_key = f"ai_suggestions:{hashlib.md5(str(keywords).encode()).hexdigest()}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    prompt = f"""트렌딩 키워드: {', '.join(keywords[:10])}

채널 최근 영상 제목:
{chr(10).join(f'- {t}' for t in recent_titles)}

위 데이터를 바탕으로 경제·시사 유튜브 채널의 다음 영상 주제 5개를 추천해주세요.
각 항목을 JSON 배열로 반환하세요:
[
  {{
    "title": "영상 제목 (클릭 유도형)",
    "hook": "첫 30초 핵심 포인트 (1문장)",
    "keywords": ["연관키워드1", "연관키워드2"],
    "expected_response": "상|중|하"
  }}
]"""

    msg = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        messages=[
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }
        ],
        system="당신은 경제·시사 유튜브 채널 콘텐츠 기획자입니다. "
               "구독자 관심사: 주식, 부동산, 거시경제, 글로벌 이슈. "
               "반드시 유효한 JSON만 반환하세요."
    )

    suggestions = json.loads(msg.content[0].text)
    await redis.setex(cache_key, 3600, json.dumps(suggestions))  # TTL 1시간
    return suggestions
```

### 엔드포인트

```
GET /trends/suggestions
→ Redis 캐시 확인 → miss 시 Claude API 호출
→ 1시간 캐시 (키워드 변경 시 자동 갱신)
```

### 프론트엔드 카드 UI

```
┌─────────────────────────────────────┐
│ ✨ AI 콘텐츠 제안              [갱신] │
├─────────────────────────────────────┤
│ 1위 예상 반응: 상                    │
│ "반도체 패권 전쟁 — 삼성 vs TSMC    │
│  2026년 승자는?"                    │
│ 핵심: HBM4 공급 계약이 갈림목       │
│ 키워드: #반도체 #AI #TSMC           │
├─────────────────────────────────────┤
│ 2위 예상 반응: 중  ...              │
└─────────────────────────────────────┘
```

### 비용 구조

| 항목 | 수치 |
|------|------|
| 모델 | claude-sonnet-4-6 |
| 입력 단가 | $3.00 / 1M tokens |
| 출력 단가 | $15.00 / 1M tokens |
| 요청당 입력 | ~500 tokens |
| 요청당 출력 | ~400 tokens |
| **요청당 비용** | **~$0.008** |
| Redis 1h 캐시 효과 | 시간당 최대 1회 호출 |
| 일 24회 최대 | ~$0.19/일 (실제는 훨씬 적음) |

---

## ANA-04 — 썸네일 유형별 CTR 분석

### 도구: OpenAI GPT-4o Vision API

**선택 이유**: 이미지 내 얼굴 감지·텍스트 비율·감정 분석을 단일 API로 처리 가능. 대안으로 Google Cloud Vision API 사용 시 비용 절반이나 통합 코드 복잡도 증가.

### 파이프라인

```
① YouTube Analytics API
   reports.query(metrics="clicks,impressions,ctr", dimensions="video")
   → 영상별 CTR 데이터 수집

② 각 영상 thumbnail_url → GPT-4o Vision 분석
   → {has_face, face_count, text_ratio, dominant_color, emotion}
   → Redis 영구 캐시 (영상 ID 기준 — 썸네일은 거의 변경 안 됨)

③ scikit-learn 분석
   특성 벡터 → LinearRegression → CTR 예측 계수
   → 인사이트 생성

④ GET /analysis/thumbnail-insights → 프론트엔드 카드 표시
```

### 구현

```python
from openai import AsyncOpenAI

oai = AsyncOpenAI()

async def analyze_thumbnail(thumbnail_url: str, video_id: str, redis: Redis) -> dict:
    cache_key = f"thumbnail_analysis:{video_id}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    resp = await oai.chat.completions.create(
        model="gpt-4o",
        max_tokens=150,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": thumbnail_url, "detail": "low"}  # 비용 절감
                },
                {
                    "type": "text",
                    "text": (
                        "이 유튜브 썸네일을 분석해서 JSON으로만 반환하세요:\n"
                        '{"has_face": bool, "face_count": int, '
                        '"text_ratio": float 0-1, '
                        '"dominant_color": "#hex", '
                        '"emotion": "positive|neutral|negative|urgent"}'
                    )
                }
            ]
        }]
    )
    result = json.loads(resp.choices[0].message.content)
    await redis.set(cache_key, json.dumps(result))  # TTL 없음 (영구)
    return result


def compute_ctr_insights(analyses: list[dict], ctrs: list[float]) -> dict:
    """scikit-learn으로 썸네일 특성 → CTR 상관관계 분석"""
    from sklearn.linear_model import LinearRegression
    import numpy as np

    X = np.array([[
        int(a["has_face"]),
        a["face_count"],
        a["text_ratio"],
        1 if a["emotion"] == "urgent" else 0
    ] for a in analyses])
    y = np.array(ctrs)

    model = LinearRegression().fit(X, y)
    return {
        "face_effect": f"+{model.coef_[0]*100:.1f}% CTR (얼굴 포함 시)",
        "text_ratio_effect": f"{model.coef_[2]*100:.1f}% CTR/텍스트10%증가",
        "urgent_effect": f"+{model.coef_[3]*100:.1f}% CTR (긴급 감정)",
        "r2_score": round(model.score(X, y), 3)
    }
```

### 비용 구조

| 항목 | 수치 |
|------|------|
| 모델 | gpt-4o (detail: low) |
| 이미지당 비용 | ~$0.002 (low detail 모드) |
| 채널 영상 100개 분석 | ~$0.20 (1회성) |
| Redis 영구 캐시 | 이후 재분석 $0 |
| 신규 영상 추가 시 | 영상당 $0.002 |

---

## ANA-05 — 최적 업로드 시간대 추천

### 도구: 없음 (numpy + scikit-learn)

**AI 불필요**. YouTube Analytics의 시청자 활동 데이터를 통계적으로 분석하는 것으로 충분.

### 파이프라인

```
YouTube Analytics API
  reports.query(
    metrics="views,subscribersGained",
    dimensions="day,hour"  → 요일(0~6) × 시간(0~23) 조합
  )
  → 7×24 numpy 행렬로 변환
  → 정규화 (0.0~1.0)
  → 상위 10% 시간대 추출 → 추천 목록
  → Recharts HeatmapChart 또는 CalendarChart 시각화
```

### 구현

```python
import numpy as np

def compute_best_upload_times(analytics_data: list[dict]) -> dict:
    matrix = np.zeros((7, 24))  # [요일][시간]

    for row in analytics_data:
        day = int(row["day"])    # 0=월 ~ 6=일
        hour = int(row["hour"])
        matrix[day][hour] += row["views"]

    # 정규화
    matrix = (matrix - matrix.min()) / (matrix.max() - matrix.min())

    # 상위 10% 시간대
    threshold = np.percentile(matrix, 90)
    recommendations = []
    days = ["월", "화", "수", "목", "금", "토", "일"]
    for d in range(7):
        for h in range(24):
            if matrix[d][h] >= threshold:
                recommendations.append({
                    "day": days[d],
                    "hour": h,
                    "score": round(float(matrix[d][h]), 3)
                })

    return {
        "heatmap": matrix.tolist(),   # 프론트엔드 시각화용
        "top_times": sorted(recommendations, key=lambda x: -x["score"])[:5]
    }
```

### 출력 예시

```json
{
  "top_times": [
    { "day": "화", "hour": 18, "score": 1.000 },
    { "day": "목", "hour": 19, "score": 0.943 },
    { "day": "월", "hour": 18, "score": 0.921 }
  ],
  "heatmap": [[0.1, 0.2, ...], ...]
}
```

---

## 구현 순서 권장안

```
Week 1 (비용 제로 항목 먼저)
  ├─ TRD-04: Redis 히스토리 append + Recharts LineChart
  └─ ANA-05: YouTube Analytics → numpy 히트맵

Week 2 (LLM 연동)
  ├─ TRD-03: Claude Haiku 뉴스 요약 + Redis 24h 캐시
  └─ TRD-06: Claude Sonnet 콘텐츠 제안 + Redis 1h 캐시

Week 3 (Vision AI)
  └─ ANA-04: GPT-4o Vision 썸네일 분석 + scikit-learn CTR 상관관계
```

## 월간 예상 비용 (운영 초기 기준)

| 기능 | 월간 호출 예상 | 월간 비용 |
|------|-------------|---------|
| TRD-03 뉴스 요약 | 900건 (일 30건) | ~$0.90 |
| TRD-06 콘텐츠 제안 | 720회 (시간당 1회) | ~$5.76 |
| ANA-04 썸네일 분석 | 50건 (신규 영상) | ~$0.10 |
| **합계** | | **~$6.76/월** |
