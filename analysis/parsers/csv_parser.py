import csv
import io
from typing import Any
from parsers.base import BaseParser

# 지원하는 컬럼명 매핑 (소문자 → 표준 키)
_TIMESTAMP_COLS = {"timestamp", "time", "date", "datetime", "날짜", "시간"}
_USER_COLS = {"user", "username", "author", "nickname", "name", "유저", "닉네임", "작성자"}
_MESSAGE_COLS = {"message", "content", "text", "msg", "chat", "메시지", "내용"}


def _map_columns(fieldnames: list[str]) -> dict[str, str]:
    """헤더 컬럼명을 표준 키(timestamp, user, message)로 매핑."""
    mapping: dict[str, str] = {}
    for col in fieldnames:
        lower = col.lower().strip()
        if lower in _TIMESTAMP_COLS and "timestamp" not in mapping:
            mapping["timestamp"] = col
        elif lower in _USER_COLS and "user" not in mapping:
            mapping["user"] = col
        elif lower in _MESSAGE_COLS and "message" not in mapping:
            mapping["message"] = col
    return mapping


class CSVParser(BaseParser):
    """CSV 형식 채팅 파일 파서."""

    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        encoding = self.detect_encoding(content)
        try:
            text = content.decode(encoding)
        except UnicodeDecodeError:
            text = content.decode("cp949", errors="replace")

        reader = csv.DictReader(io.StringIO(text))
        fieldnames = list(reader.fieldnames or [])

        if not fieldnames:
            raise ValueError("CSV 파일에 헤더가 없습니다.")

        mapping = _map_columns(fieldnames)

        records: list[dict[str, Any]] = []
        for i, row in enumerate(reader):
            if mapping:
                ts = row.get(mapping.get("timestamp", ""), "").strip()
                user = row.get(mapping.get("user", ""), "").strip()
                msg = row.get(mapping.get("message", ""), "").strip()
            else:
                # 헤더 매핑 실패 시 인덱스 fallback
                values = list(row.values())
                ts = values[0].strip() if len(values) > 0 else ""
                user = values[1].strip() if len(values) > 1 else ""
                msg = values[2].strip() if len(values) > 2 else ""

            if not msg:
                continue

            records.append({"timestamp": ts, "user": user, "message": msg})

        return records
