import re
from typing import Any
from parsers.base import BaseParser

# YouTube 채팅 형식: [HH:MM:SS] username: message  또는  HH:MM:SS username: message
_YT_PATTERN = re.compile(
    r"^\[?(\d{1,2}:\d{2}:\d{2})\]?\s+(.+?):\s+(.+)$"
)

# 카카오톡 형식: YYYY. MM. DD. HH:MM  username : message
_KAKAO_PATTERN = re.compile(
    r"^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*\d{1,2}:\d{2})\s+(.+?)\s*:\s+(.+)$"
)

# 날짜 구분선 (카카오톡 2024년 1월 1일 화요일 등)
_DATE_HEADER = re.compile(r"^-+\s*\d{4}년")


def _detect_format(lines: list[str]) -> str:
    """처음 20줄을 샘플링해서 형식 감지."""
    sample = [l for l in lines if l.strip() and not _DATE_HEADER.match(l.strip())][:20]
    yt_hits = sum(1 for l in sample if _YT_PATTERN.match(l.strip()))
    kakao_hits = sum(1 for l in sample if _KAKAO_PATTERN.match(l.strip()))
    return "youtube" if yt_hits >= kakao_hits else "kakao"


class TXTParser(BaseParser):
    """TXT 형식 채팅 파일 파서 (YouTube / 카카오톡 형식 자동 감지)."""

    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        encoding = self.detect_encoding(content)
        try:
            text = content.decode(encoding)
        except UnicodeDecodeError:
            text = content.decode("utf-8", errors="replace")

        lines = text.splitlines()
        fmt = _detect_format(lines)
        pattern = _YT_PATTERN if fmt == "youtube" else _KAKAO_PATTERN

        records: list[dict[str, Any]] = []
        for line in lines:
            line = line.strip()
            if not line or _DATE_HEADER.match(line):
                continue
            m = pattern.match(line)
            if m:
                ts, user, msg = m.group(1), m.group(2).strip(), m.group(3).strip()
                if msg:
                    records.append({"timestamp": ts, "user": user, "message": msg})

        return records
