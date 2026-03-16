package backend.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(400, "COMMON_001", "잘못된 입력값입니다"),
    ENTITY_NOT_FOUND(404, "COMMON_002", "대상을 찾을 수 없습니다"),
    UNAUTHORIZED(401, "COMMON_003", "인증이 필요합니다"),
    FORBIDDEN(403, "COMMON_004", "접근 권한이 없습니다"),

    // Post
    POST_NOT_FOUND(404, "POST_001", "게시물을 찾을 수 없습니다"),
    DUPLICATE_VOTE(409, "POST_002", "이미 투표한 게시물입니다"),

    // User
    DUPLICATE_EMAIL(409, "USER_001", "이미 사용 중인 이메일입니다"),
    USER_NOT_FOUND(404, "USER_002", "사용자를 찾을 수 없습니다");

    private final int status;
    private final String code;
    private final String message;
}
