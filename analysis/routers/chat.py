from fastapi import APIRouter, UploadFile, File, HTTPException
from models.chat import ChatAnalysisResult

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatAnalysisResult)
async def analyze_chat(file: UploadFile = File(...)) -> ChatAnalysisResult:
    """
    채팅 파일을 업로드하여 분석 결과를 반환합니다.

    지원 형식: CSV, JSON, TXT
    """
    # TODO: 파일 형식 검증 (csv / json / txt)
    # TODO: 적절한 Parser 선택 (Strategy 패턴)
    # TODO: ChatAnalyzer.analyze() 호출
    # TODO: Redis 캐시 저장 후 결과 반환
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/chat/heatmap")
async def get_heatmap(session_id: str) -> dict:
    """
    세션 ID에 해당하는 채팅 히트맵 데이터를 반환합니다.
    """
    # TODO: Redis에서 캐시된 히트맵 데이터 조회
    # TODO: 캐시 없으면 404 반환
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/chat/peaks")
async def get_peak_segments(session_id: str) -> dict:
    """
    세션 ID에 해당하는 피크 구간 목록을 반환합니다.
    """
    # TODO: Redis에서 캐시된 피크 세그먼트 조회
    raise HTTPException(status_code=501, detail="Not implemented yet")
