package backend.user.controller;

import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.global.auth.JwtTokenProvider;
import backend.global.common.ApiResponse;
import backend.user.domain.AuthProvider;
import backend.user.domain.Role;
import backend.user.domain.User;
import backend.user.dto.LoginRequestDto;
import backend.user.dto.RefreshTokenRequest;
import backend.user.dto.SignupRequestDto;
import backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider tokenProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> signup(@RequestBody SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("이미 사용 중인 이메일입니다."));
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("회원가입 성공"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("이메일 또는 비밀번호가 올바르지 않습니다."));
        }

        String accessToken = tokenProvider.createAccessToken(user.getEmail(), user.getRoleKey());
        String refreshToken = tokenProvider.createRefreshToken(user.getEmail());

        // Redis에 refreshToken 저장 (7일)
        redisTemplate.opsForValue().set(user.getEmail(), refreshToken, 7, TimeUnit.DAYS);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "accessToken", accessToken,
                        "refreshToken", refreshToken,
                        "nickname", user.getNickname(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        ));
    }

    // JSON body 기반 토큰 재발급 (프론트엔드 fetch용)
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refresh(
            @RequestBody RefreshTokenRequest request) {

        String refreshToken = request.getRefreshToken();

        if (refreshToken == null || !tokenProvider.validiteToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("유효하지 않은 Refresh Token입니다."));
        }

        Authentication authentication = tokenProvider.getAuthentication(refreshToken);
        String email = authentication.getName();

        String savedToken = redisTemplate.opsForValue().get(email);
        if (!refreshToken.equals(savedToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh Token이 일치하지 않습니다."));
        }

        String newAccessToken = tokenProvider.createAccessToken(email, "ROLE_USER");
        String newRefreshToken = tokenProvider.createRefreshToken(email);

        redisTemplate.opsForValue().set(email, newRefreshToken, 7, TimeUnit.DAYS);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("accessToken", newAccessToken, "refreshToken", newRefreshToken)
        ));
    }

    // 쿠키 기반 토큰 재발급 (레거시 — OAuth2 흐름 호환)
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<Map<String, String>>> reissue(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {

        if (refreshToken == null || !tokenProvider.validiteToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("유효하지 않은 Refresh Token입니다."));
        }

        Authentication authentication = tokenProvider.getAuthentication(refreshToken);
        String email = authentication.getName();

        String savedToken = redisTemplate.opsForValue().get(email);
        if (!refreshToken.equals(savedToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh Token이 일치하지 않습니다."));
        }

        String newAccessToken = tokenProvider.createAccessToken(email, "ROLE_USER");
        return ResponseEntity.ok(ApiResponse.success(Map.of("accessToken", newAccessToken)));
    }
}
