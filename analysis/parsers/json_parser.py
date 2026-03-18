import json
from typing import Any
from parsers.base import BaseParser

_TIMESTAMP_KEYS = {"timestamp", "time", "date", "datetime"}
_USER_KEYS = {"user", "username", "author", "nickname", "name"}
_MESSAGE_KEYS = {"message", "content", "text", "msg", "chat"}


def _normalize_record(record: dict) -> dict[str, Any] | None:
    """JSON 레코드를 표준 {timestamp, user, message} 형태로 정규화."""
    lower_map = {k.lower(): v for k, v in record.items()}

    ts = next((lower_map[k] for k in _TIMESTAMP_KEYS if k in lower_map), "")
    user = next((lower_map[k] for k in _USER_KEYS if k in lower_map), "")
    msg = next((lower_map[k] for k in _MESSAGE_KEYS if k in lower_map), "")

    if not msg:
        return None

    return {"timestamp": str(ts), "user": str(user), "message": str(msg)}


class JSONParser(BaseParser):
    """JSON 형식 채팅 파일 파서 (배열형 / 래핑 객체형 모두 지원)."""

    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        encoding = self.detect_encoding(content)
        try:
            text = content.decode(encoding)
        except UnicodeDecodeError:
            text = content.decode("utf-8", errors="replace")

        try:
            data = json.loads(text)
        except json.JSONDecodeError as e:
            raise ValueError(f"올바른 JSON 형식이 아닙니다: {e}") from e

        if isinstance(data, list):
            raw_list = data
        elif isinstance(data, dict):
            for key in ("messages", "data", "chats", "records", "items"):
                if key in data and isinstance(data[key], list):
                    raw_list = data[key]
                    break
            else:
                raise ValueError("JSON에서 채팅 배열을 찾을 수 없습니다.")
        else:
            raise ValueError("지원하지 않는 JSON 구조입니다.")

        records = [_normalize_record(item) for item in raw_list if isinstance(item, dict)]
        return [r for r in records if r is not None]
