import csv
import io
from typing import Any
from parsers.base import BaseParser


class CSVParser(BaseParser):
    """
    CSV 형식 채팅 파일 파서.

    예상 컬럼: timestamp, user, message
    (컬럼명이 다를 경우 컬럼 인덱스로 fallback)
    """

    async def parse(self, content: bytes) -> list[dict[str, Any]]:
        """
        CSV 파일을 파싱하여 채팅 레코드 리스트를 반환합니다.

        Args:
            content: CSV 파일의 raw 바이트

        Returns:
            채팅 레코드 리스트

        Raises:
            ValueError: CSV 형식이 올바르지 않을 때
        """
        encoding = self.detect_encoding(content)
        text = content.decode(encoding)

        # TODO: csv.DictReader로 파싱
        # TODO: 컬럼명 정규화 (timestamp / time / date → "timestamp")
        # TODO: 빈 메시지 필터링
        # TODO: timestamp 형식 통일 (ISO 8601)
        reader = csv.DictReader(io.StringIO(text))
        records: list[dict[str, Any]] = []
        for row in reader:
            # TODO: 실제 컬럼 매핑 구현
            records.append(dict(row))
        return records
