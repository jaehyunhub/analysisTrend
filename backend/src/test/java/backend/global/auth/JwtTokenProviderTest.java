package backend.global.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    // 256비트 이상 Base64 인코딩 시크릿 (테스트용)
    private static final String SECRET =
            "dGVzdHNlY3JldGtleXRlc3RzZWNyZXRrZXl0ZXN0c2VjcmV0a2V5dGVzdA==";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenValidity", 1800000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenValidity", 604800000L);
        jwtTokenProvider.init();
    }

    @Test
    @DisplayName("Access Token 생성 및 검증 성공")
    void createAndValidateAccessToken() {
        // given
        String email = "test@example.com";
        String role = "ROLE_USER";

        // when
        String token = jwtTokenProvider.createAccessToken(email, role);

        // then
        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validiteToken(token)).isTrue();
    }

    @Test
    @DisplayName("Refresh Token 생성 및 검증 성공")
    void createAndValidateRefreshToken() {
        // given
        String email = "test@example.com";

        // when
        String token = jwtTokenProvider.createRefreshToken(email);

        // then
        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validiteToken(token)).isTrue();
    }

    @Test
    @DisplayName("만료된 토큰은 검증 실패")
    void expiredTokenValidationFails() {
        // given: 유효시간 -1로 즉시 만료 토큰 생성
        JwtTokenProvider expiredProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(expiredProvider, "secretKey", SECRET);
        ReflectionTestUtils.setField(expiredProvider, "accessTokenValidity", -1L);
        ReflectionTestUtils.setField(expiredProvider, "refreshTokenValidity", -1L);
        expiredProvider.init();

        // when
        String expiredToken = expiredProvider.createAccessToken("test@example.com", "ROLE_USER");

        // then
        assertThat(jwtTokenProvider.validiteToken(expiredToken)).isFalse();
    }

    @Test
    @DisplayName("잘못된 형식의 토큰은 검증 실패")
    void invalidTokenValidationFails() {
        assertThat(jwtTokenProvider.validiteToken("this.is.not.valid")).isFalse();
    }

    @Test
    @DisplayName("Access Token에서 이메일(subject) 추출 성공")
    void extractEmailFromToken() {
        // given
        String email = "test@example.com";
        String token = jwtTokenProvider.createAccessToken(email, "ROLE_USER");

        // when
        String extractedEmail = jwtTokenProvider.getAuthentication(token).getName();

        // then
        assertThat(extractedEmail).isEqualTo(email);
    }
}
