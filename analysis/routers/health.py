from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    """서비스 헬스체크 엔드포인트"""
    return {"status": "ok"}


@router.get("/")
def root() -> dict:
    """루트 엔드포인트"""
    return {"message": "Hello from Analysis Service"}
