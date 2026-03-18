package backend.global.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import backend.global.auth.JwtAuthenticationFilter;
import backend.global.auth.OAuth2SuccessHandler;
import backend.user.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2SuccessHandler oAuth2SuccessHandler;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
                return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                // 기본 로그인 창(Form Login) 끄기 JWT를 쓸 거라 아이디/비번 입력 창이 필요없어서 설정 끔
                                .formLogin(AbstractHttpConfigurer::disable)

                                // 기본 HTTP Basic 인증 끄기 (콘솔에 비번 안 뜨게 함)
                                .httpBasic(AbstractHttpConfigurer::disable)
                                // 세션 관리 필터에게 세션에 저장하지마라고 명령
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/", "/error", "/favicon.ico").permitAll()
                                                .requestMatchers("/oauth2/**", "/login/**",
                                                                "/api/v1/auth/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/communities", "/api/v1/communities/**",
                                                                "/api/v1/posts", "/api/v1/posts/**",
                                                                "/api/v1/products", "/api/v1/products/**",
                                                                "/api/v1/banners", "/api/v1/banners/**",
                                                                "/api/v1/schedules", "/api/v1/schedules/**",
                                                                "/api/v1/youtube", "/api/v1/youtube/**",
                                                                "/swagger-ui/**", "/v3/api-docs/**")
                                                .permitAll()
                                                .requestMatchers("/api/v1/admin/**")
                                                .hasRole("ADMIN")
                                                .anyRequest().authenticated())

                                // 이 필터가 카카오/구글/네이버 로그인을 처리한다.
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler))

                                // *JWT 필터를 UsernamePasswordAUthenticationFilter 앞에 끼워넣기
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost", "http://localhost:3000"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
