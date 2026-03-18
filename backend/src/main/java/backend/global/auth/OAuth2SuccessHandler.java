package backend.global.auth;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import backend.user.domain.User;
import backend.user.dto.CustomOAuth2User;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        private final JwtTokenProvider tokenProvider;
        private final RedisTemplate<String, String> redisTemplate;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                        Authentication authentication) throws IOException {
                CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
                User user = oAuth2User.getUser();

                // 1. 토큰 생성
                String accessToken = tokenProvider.createAccessToken(user.getEmail(), user.getRoleKey());
                String refreshToken = tokenProvider.createRefreshToken(user.getEmail());

                // 2. Refresh Token을 Redis에 저장 (Key: 이메일, Value: 토큰) -> 유효기간 7일
                redisTemplate.opsForValue().set(
                                user.getEmail(),
                                refreshToken,
                                7,
                                TimeUnit.DAYS);

                // 3. Refresh Token은 HttpOnly 쿠키로 발급 (자바스크립트 접근 불가, 보안 강화)
                Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
                // XSS 방어(자바크립트가 못 읽게 함)
                refreshCookie.setHttpOnly(true);
                // 도청 방어(HTTPS에서만 전송)
                refreshCookie.setSecure(true); // HTTPS 적용 시 필수 (로컬에선 false로 테스트 가능)
                // 경로 제한(토큰 재발급 요청할 때만 쿠키 전송)
                refreshCookie.setPath("/");
                refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
                response.addCookie(refreshCookie);

                // 4. Access Token + Refresh Token을 프론트엔드로 리다이렉트 (쿼리 파라미터)
                String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth/callback")
                                .queryParam("accessToken", accessToken)
                                .queryParam("refreshToken", refreshToken)
                                .build().toUriString();

                getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
}
