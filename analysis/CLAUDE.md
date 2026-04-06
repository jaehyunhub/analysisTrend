# analysis/CLAUDE.md

분석 서비스(FastAPI Python) 전용 가이드. 루트 `CLAUDE.md`와 함께 참고.

## 명령어

```bash
uvicorn main:app --reload --port 8000  # 개발 서버
pytest tests/                          # 단위 테스트
# 환경변수 변경 시 Docker 이미지 재빌드 필요:
# docker-compose build analysis
```

## 구조

```
analysis/
├── main.py           — FastAPI 앱 진입점. lifespan으로 APScheduler 연동
├── config.py         — pydantic-settings 환경 변수 (NAVER_CLIENT_ID, YOUTUBE_API_KEY 등)
├── routers/
│   ├── health.py     — 헬스체크
│   ├── chat.py       — prefix: /analyze
│   └── trends.py     — prefix: /trends
├── services/
│   ├── chat_analyzer.py  — 버킷 집계·피크 감지·TF-IDF
│   ├── news_collector.py — Naver News API
│   ├── youtube_collector.py — YouTube Data API v3
│   └── cache.py          — Redis 비동기 캐시
├── parsers/          — Strategy 패턴 (base.py BOM/인코딩 감지, csv_parser, json_parser, txt_parser)
├── models/
│   ├── chat.py       — HeatmapBucket, PeakSegment, ChatAnalysisResult, KeywordTimeline
│   └── trend.py      — TrendKeyword, TrendingVideo
├── tasks/
│   └── scheduler.py  — APScheduler AsyncIOScheduler, 30분 주기 뉴스 키워드 수집
└── tests/            — pytest-asyncio + AsyncMock
    ├── test_parsers.py      (13개)
    ├── test_chat_analyzer.py (12개)
    ├── test_cache.py        (8개)
    └── test_trends.py       (15개)
```

## 주요 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/analyze/chat` | 채팅 파일 업로드 분석 (CSV/JSON/TXT) |
| GET | `/analyze/chat/session/{session_id}` | 캐시된 분석 결과 조회 |
| GET | `/trends/news` | 뉴스 키워드 (Redis 캐시 30분, Naver News API) |
| GET | `/trends/news/articles` | 뉴스 원문 기사 목록 (Redis 캐시 30분) |
| GET | `/trends/youtube?region=KR&category=0` | YouTube 트렌딩 (Redis 캐시 30분, YouTube Data API v3) |
| GET | `/trends/keywords` | 뉴스+YouTube 통합 키워드 |

## Redis 캐시

- TTL: 30분
- 캐시 키: `news_keywords`, `news_articles_트렌드_20`, `trending_KR_0` 등
- 구버전 캐시로 날짜 필터가 안 되는 경우: `redis-cli DEL news_articles_트렌드_20 trending_KR_0`

## Mock 데이터 (API 키 없을 때)

### YouTube (`youtube_collector.py`)

```python
# 정적 리스트 금지 — 호출마다 동적 생성 필수
def _build_mock_videos() -> list[TrendingVideo]:
    # datetime.now(timezone.utc) 기준 상대 날짜 사용
    _DAYS_AGO = [0.2, 0.5, 0.8, 0.9, 1.0, 0.3,
                 2, 3, 4, 5, 6, 7,
                 10, 14, 18, 22, 25, 28, 30, 31]
```

정적 날짜(`"2025-03-15T09:00:00Z"`)는 모든 필터에서 빈 결과를 반환하므로 **절대 사용 금지**.

### 뉴스 (`news_collector.py`)

```python
# _mock_articles 내부에서 rfc2822(days_ago) 함수로 동적 날짜 생성
def rfc2822(days_ago: float) -> str:
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return format_datetime(dt)
# 현재 days_ago: 0.3, 0.8, 3, 5, 15
```

`TrendKeyword`에는 날짜 필드 없음 — 뉴스 키워드 날짜 필터 불가 (프론트엔드에서 필터 버튼 미표시).

## 채팅 분석 (`chat_analyzer.py`)

- **피크 감지**: `평균 + 1.5 × 표준편차` 초과 버킷 → 피크 판정 (`sigma_factor=1.5`)
- 연속 피크 버킷 → 하나의 구간으로 병합
- **키워드 검색**: `search_keywords` Form 파라미터(쉼표 구분) → `analyzer.analyze(records, search_keywords=kw_list)`. 검색 키워드가 자동 추출 키워드보다 우선 배치
- `KeywordTimeline.timestamps` — 등장한 분 단위 타임스탬프 목록 (`List[str]`)

## yt-dlp 채팅 추출

```bash
yt-dlp --write-subs --sub-lang live_chat --skip-download "URL"
```

- 생성 파일: `.live_chat.json`
- `replayChatItemAction.videoOffsetTimeMsec` 기준 `HH:MM:SS` 변환 필요
- 채널 설정에서 채팅 리플레이 비활성화 시 추출 불가 (Money Comics 채널 등)
- 샘플: `chat_samples/슈카월드_live_chat.json` (23,943개 메시지)

## 테스트 결과 (2026-03-27)

**48 passed / 0 errors**

- `@pytest_asyncio.fixture` 수정 완료
- `test_keywords_merged_scores` mock 패치 적용 완료
