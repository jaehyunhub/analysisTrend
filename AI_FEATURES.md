# AI 기능 명세

> 이 파일의 정본은 **[claudedocs/AI_FEATURES.md](./claudedocs/AI_FEATURES.md)** 입니다.
> API 발급 가이드: **[claudedocs/api_keys.md](./claudedocs/api_keys.md)**

---

## 빠른 참조

| 기능 ID | 기능명 | 도구 | 현황 |
|---------|--------|------|------|
| TRD-03 | 뉴스 원문 3줄 요약 | Groq / Claude Haiku | 미구현 |
| TRD-04 | 키워드 시계열 차트 | Redis + Recharts | 미구현 |
| TRD-06 | AI 콘텐츠 제안 | Groq / Claude Sonnet | 미구현 |
| ANA-04 | 썸네일 CTR 분석 | Ollama / GPT-4o Vision | 미구현 |
| ANA-05 | 최적 업로드 시간 추천 | scikit-learn | 미구현 |
| CHAT-02 | 채팅 키워드 시간대 목록 | TF-IDF + 선택적 LLM | 부분 구현 |
| CHAT-06 | 시청자 감정 분석 | KoELECTRA | 미구현 |

## 월간 비용 비교

| 구분 | Claude + GPT-4o | Groq + Ollama (오픈소스) |
|------|----------------|------------------------|
| 합계 | ~$6.76/월 | **$0/월** |

→ 상세 내용은 [claudedocs/AI_FEATURES.md](./claudedocs/AI_FEATURES.md) 참고
