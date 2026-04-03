import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models.chat import ChatAnalysisResult
from parsers.csv_parser import CSVParser
from parsers.json_parser import JSONParser
from parsers.txt_parser import TXTParser
from services.chat_analyzer import ChatAnalyzer
from services.cache import cache_get, cache_set

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chat"])

_PARSERS = {
    "csv": CSVParser(),
    "json": JSONParser(),
    "txt": TXTParser(),
}


def _get_parser(filename: str):
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "txt").lower()
    parser = _PARSERS.get(ext)
    if parser is None:
        raise HTTPException(
            status_code=415,
            detail=f"지원하지 않는 파일 형식입니다: .{ext} (지원: csv, json, txt)"
        )
    return parser


@router.post("/chat", response_model=ChatAnalysisResult)
async def analyze_chat(
    file: UploadFile = File(...),
    search_keywords: Optional[str] = Form(None),
) -> ChatAnalysisResult:
    """
    채팅 파일을 업로드하여 분석 결과를 반환합니다.

    지원 형식: CSV, JSON, TXT
    search_keywords: 쉼표로 구분된 검색 키워드 (선택사항, 예: "ㅋㅋㅋ,경제,주식")
    """
    parser = _get_parser(file.filename or "upload.txt")

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"파일 읽기 실패: {e}") from e

    try:
        records = await parser.parse(content)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    kw_list = (
        [k.strip() for k in search_keywords.split(",") if k.strip()]
        if search_keywords
        else []
    )

    analyzer = ChatAnalyzer()
    result = await analyzer.analyze(records, search_keywords=kw_list)

    # Redis 캐시 저장 (session_id 키, TTL 1시간)
    try:
        await cache_set(f"chat:{result.session_id}", result.model_dump(), ttl=3600)
    except Exception as e:
        logger.warning("채팅 분석 캐시 저장 실패: %s", e)

    return result


@router.get("/chat/session/{session_id}", response_model=ChatAnalysisResult)
async def get_session(session_id: str) -> ChatAnalysisResult:
    """세션 ID로 캐시된 분석 결과를 조회합니다."""
    cached = await cache_get(f"chat:{session_id}")
    if cached is None:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return ChatAnalysisResult(**cached)


@router.get("/chat/heatmap")
async def get_heatmap(session_id: str) -> dict:
    """세션 ID에 해당하는 채팅 히트맵 데이터를 반환합니다."""
    cached = await cache_get(f"chat:{session_id}")
    if cached is None:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return {"session_id": session_id, "heatmap": cached.get("heatmap", [])}


@router.get("/chat/peaks")
async def get_peak_segments(session_id: str) -> dict:
    """세션 ID에 해당하는 피크 구간 목록을 반환합니다."""
    cached = await cache_get(f"chat:{session_id}")
    if cached is None:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return {"session_id": session_id, "peaks": cached.get("peaks", [])}
