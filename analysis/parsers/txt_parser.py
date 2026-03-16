import re
from typing import Any
from parsers.base import BaseParser


# 카카오톡 채팅 내보내기 기본 패턴 예시:
# [닉네임] [오전/오후 HH:MM] 메시지
KAKAO_PATTERN = re.compile(
    r"\[(?P<user>.+?)\]\s+\[(?:오전|오후)\s+(?P<time>\d{1,2}:\d{2})\]\s+(?P<message>.+)"
)

# 일반 텍스트 타임스탬프 패턴 예시:
# 2024-01-01 12:00:00 [닉네임] 메시지
GENERIC_PATTERN = re.compile(
    r"(?P<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\s+\[?(?P<user>[^\]]+)\]?\s+(?P<message>.+)"
)


class TXTParser(BaseParser):
    """
    TXT 형식 채팅 파일 파서.

    카카오톡 채팅 내보내기 형식과 일반 타임스탬프 형식을 지원합니다.
    """

    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        """
        TXT 파일을 파싱하여 채팅 레코드 리스트를 반환합니다.

        Args:
            content: TXT 파일의 raw 바이트

        Returns:
            채팅 레코드 리스트

        Raises:
            ValueError: 인식 가능한 패턴이 없을 때
        """
        encoding = self.detect_encoding(content)
        text = content.decode(encoding)
        lines = text.splitlines()

        records: list[dict[str, Any]] = []
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # TODO: KAKAO_PATTERN 매칭 시도
            # TODO: 실패하면 GENERIC_PATTERN 시도
            # TODO: 날짜 헤더 라인 (예: "----------- 2024년 1월 1일 -----------") 건너뛰기
            # TODO: 타임스탬프 ISO 8601 변환
            match = GENERIC_PATTERN.match(line) or KAKAO_PATTERN.match(line)
            if match:
                records.append(match.groupdict())

        if not records:
            raise ValueError("파싱 가능한 채팅 레코드를 찾지 못했습니다.")
        return records
