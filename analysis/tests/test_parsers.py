import pytest
from parsers.csv_parser import CSVParser
from parsers.json_parser import JSONParser
from parsers.txt_parser import TXTParser


# ─── CSV Parser ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_csv_parser_standard_headers():
    """표준 헤더(timestamp, user, message) CSV 파싱."""
    csv_content = b"timestamp,user,message\n2025-01-01 10:00,Alice,Hello\n2025-01-01 10:01,Bob,World\n"
    parser = CSVParser()
    records = await parser.parse(csv_content)
    assert len(records) == 2
    assert records[0]["user"] == "Alice"
    assert records[0]["message"] == "Hello"
    assert records[1]["user"] == "Bob"


@pytest.mark.asyncio
async def test_csv_parser_alias_headers():
    """별칭 헤더(time, username, content) CSV 파싱."""
    csv_content = b"time,username,content\n10:00,User1,Hi there\n"
    parser = CSVParser()
    records = await parser.parse(csv_content)
    assert len(records) == 1
    assert records[0]["user"] == "User1"
    assert records[0]["message"] == "Hi there"


@pytest.mark.asyncio
async def test_csv_parser_skip_empty_messages():
    """메시지 없는 행 건너뜀."""
    csv_content = b"timestamp,user,message\n10:00,Alice,Hello\n10:01,Bob,\n10:02,Alice,Bye\n"
    parser = CSVParser()
    records = await parser.parse(csv_content)
    assert len(records) == 2


@pytest.mark.asyncio
async def test_csv_parser_no_header_raises():
    """헤더 없는 빈 CSV는 ValueError 발생."""
    csv_content = b""
    parser = CSVParser()
    with pytest.raises(ValueError, match="헤더"):
        await parser.parse(csv_content)


@pytest.mark.asyncio
async def test_csv_parser_korean_headers():
    """한국어 헤더 매핑."""
    csv_content = "날짜,닉네임,메시지\n2025-01-01,철수,안녕\n".encode("utf-8")
    parser = CSVParser()
    records = await parser.parse(csv_content)
    assert len(records) == 1
    assert records[0]["user"] == "철수"
    assert records[0]["message"] == "안녕"


# ─── JSON Parser ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_json_parser_array():
    """배열 형식 JSON 파싱."""
    import json
    data = [
        {"timestamp": "10:00", "user": "Alice", "message": "Hello"},
        {"timestamp": "10:01", "user": "Bob", "message": "World"},
    ]
    content = json.dumps(data).encode()
    parser = JSONParser()
    records = await parser.parse(content)
    assert len(records) == 2
    assert records[0]["user"] == "Alice"


@pytest.mark.asyncio
async def test_json_parser_wrapped():
    """{"messages": [...]} 래핑 형식 JSON 파싱."""
    import json
    data = {"messages": [{"time": "10:00", "username": "Alice", "content": "Hi"}]}
    content = json.dumps(data).encode()
    parser = JSONParser()
    records = await parser.parse(content)
    assert len(records) == 1
    assert records[0]["message"] == "Hi"


@pytest.mark.asyncio
async def test_json_parser_invalid_raises():
    """유효하지 않은 JSON은 ValueError 발생."""
    parser = JSONParser()
    with pytest.raises(ValueError):
        await parser.parse(b"not json at all {{{")


@pytest.mark.asyncio
async def test_json_parser_skip_empty_messages():
    """메시지 없는 항목 건너뜀."""
    import json
    data = [
        {"timestamp": "10:00", "user": "Alice", "message": "Hello"},
        {"timestamp": "10:01", "user": "Bob", "message": ""},
    ]
    content = json.dumps(data).encode()
    parser = JSONParser()
    records = await parser.parse(content)
    assert len(records) == 1


# ─── TXT Parser ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_txt_parser_youtube_format():
    """YouTube 라이브 채팅 형식 파싱 ([HH:MM:SS] user: msg)."""
    content = b"[00:01:30] Alice: Hello everyone\n[00:02:00] Bob: Great stream!\n"
    parser = TXTParser()
    records = await parser.parse(content)
    assert len(records) == 2
    assert records[0]["user"] == "Alice"
    assert records[0]["message"] == "Hello everyone"


@pytest.mark.asyncio
async def test_txt_parser_kakao_format():
    """카카오톡 형식 파싱 (YYYY. MM. DD. HH:MM user: msg)."""
    # 카카오 실제 형식: YYYY. MM. DD. HH:MM 로 시작
    content = "2025. 01. 01. 10:00 철수 : 안녕\n2025. 01. 01. 10:01 영희 : 반가워\n".encode("utf-8")
    parser = TXTParser()
    records = await parser.parse(content)
    assert len(records) == 2
    assert records[0]["user"] == "철수"


@pytest.mark.asyncio
async def test_txt_parser_mixed_lines():
    """날짜 헤더 라인은 건너뜀."""
    content = b"--- 2025\xeb\x85\x84 1\xec\x9b\x94 1\xec\x9d\xbc ---\n[00:01:00] Alice: Hello\n"
    parser = TXTParser()
    records = await parser.parse(content)
    # 날짜 헤더는 제외, Alice 메시지만 포함
    assert len(records) == 1
    assert records[0]["user"] == "Alice"


@pytest.mark.asyncio
async def test_txt_parser_empty_returns_empty():
    """내용 없는 파일은 빈 리스트 반환."""
    parser = TXTParser()
    records = await parser.parse(b"")
    assert records == []
