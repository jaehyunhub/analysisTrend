import json
from typing import Any
from parsers.base import BaseParser


class JSONParser(BaseParser):
    """
    JSON 형식 채팅 파일 파서.

    지원 구조:
    - 리스트: [{"timestamp": ..., "user": ..., "message": ...}, ...]
    - 딕셔너리: {"messages": [...]} 또는 {"data": [...]}
    """

    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        """
        JSON 파일을 파싱하여 채팅 레코드 리스트를 반환합니다.

        Args:
            content: JSON 파일의 raw 바이트

        Returns:
            채팅 레코드 리스트

        Raises:
            ValueError: JSON 형식이 올바르지 않거나 구조가 예상과 다를 때
        """
        encoding = self.detect_encoding(content)
        text = content.decode(encoding)

        try:
            data = json.loads(text)
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON 파싱 실패: {e}") from e

        # TODO: 최상위 구조 분기 (list vs dict)
        # TODO: dict인 경우 "messages" / "data" / "chats" 키 탐색
        # TODO: 각 레코드의 키 정규화
        # TODO: 빈 메시지 및 timestamp 없는 레코드 필터링
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for key in ("messages", "data", "chats"):
                if key in data:
                    return data[key]
        raise ValueError("지원하지 않는 JSON 구조입니다.")
