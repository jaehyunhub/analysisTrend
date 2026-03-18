from abc import ABC, abstractmethod
from typing import Any


class BaseParser(ABC):
    """
    채팅 파일 파서 추상 기반 클래스 (Strategy 패턴).

    각 파서는 raw 바이트 데이터를 받아
    {"timestamp": str, "user": str, "message": str} 형태의 레코드 리스트를 반환해야 합니다.
    """

    @abstractmethod
    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        """
        파일 내용을 파싱하여 채팅 레코드 리스트를 반환합니다.

        Args:
            content: 업로드된 파일의 raw 바이트

        Returns:
            채팅 레코드 리스트. 각 레코드:
            {
                "timestamp": "2024-01-01T12:00:00",
                "user": "닉네임",
                "message": "채팅 내용"
            }

        Raises:
            ValueError: 파일 형식이 올바르지 않을 때
        """
        ...

    @staticmethod
    def detect_encoding(content: bytes) -> str:
        """바이트 스트림의 인코딩을 감지합니다. BOM 우선, 이후 chardet 사용."""
        # BOM 체크
        if content.startswith(b"\xef\xbb\xbf"):
            return "utf-8-sig"
        if content.startswith(b"\xff\xfe"):
            return "utf-16-le"
        if content.startswith(b"\xfe\xff"):
            return "utf-16-be"

        try:
            import chardet  # type: ignore
            result = chardet.detect(content[:4096])
            encoding = result.get("encoding") or "utf-8"
            return encoding
        except ImportError:
            pass

        # 단순 UTF-8 검증
        try:
            content.decode("utf-8")
            return "utf-8"
        except UnicodeDecodeError:
            return "cp949"
