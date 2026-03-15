package backend.user.controller;

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
import backend.user.domain.AuthProvider;
import backend.user.domain.Role;
import backend.user.domain.User;
import backend.user.dto.LoginRequestDto;
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
    public ResponseEntity<String> signup(@RequestBody SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String accessToken = tokenProvider.createAccessToken(user.getEmail(), user.getRoleKey());
        return ResponseEntity.ok(accessToken);
    }

    @PostMapping("/reissue")
    public ResponseEntity<String> reissue(@CookieValue(name = "refresh_token", required = false) String refreshToken) {

        if (refreshToken == null || !tokenProvider.validiteToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Refresh Token");
        }

        // 토큰에서 이메일 추출
        Authentication authentication = tokenProvider.getAuthentication(refreshToken);
        String email = authentication.getName();

        // Redis에 저장된 토큰과 비교(로그아웃된 토큰인지, 탈취된 토큰인지 확인)
        String savedToken = redisTemplate.opsForValue().get(email);
        if (!refreshToken.equals(savedToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token mismatch");
        }

        // 새 Access Token 발급
        String newAccessToken = tokenProvider.createAccessToken(email, "ROLE_USER");
        return ResponseEntity.ok(newAccessToken);
    }
}
