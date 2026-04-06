# backend/CLAUDE.md

백엔드(Spring Boot 3.5) 전용 가이드. 루트 `CLAUDE.md`와 함께 참고.

## 명령어

```bash
./gradlew bootRun                                      # 서버 실행 :8080
./gradlew test                                         # 전체 테스트 (JUnit 5, H2 인메모리)
./gradlew test --tests "backend.SomeTest.methodName"   # 단일 테스트
./gradlew build                                        # JAR 빌드
```

## 패키지 구조

```
backend/src/main/java/backend/
├── global/
│   ├── config/     — SecurityConfig, RedisConfig, WebMvcConfig, JpaAuditingConfig
│   ├── auth/       — JwtTokenProvider, JwtAuthenticationFilter, OAuth2SuccessHandler
│   ├── controller/ — HealthController
│   ├── baseEntity/ — BaseTimeEntity (createdAt, updatedAt JPA 감사)
│   ├── exception/  — GlobalExceptionHandler, ErrorCode, ErrorResponse, BusinessException
│   └── common/     — ApiResponse<T> (success, data, message, timestamp)
├── user/           — domain (User, Role, AuthProvider), repository, service, controller, DTO
├── community/      — Community 도메인 (CRUD)
├── post/           — Post·Comment·Vote 도메인 (투표, 댓글 중첩)
├── product/        — Product 도메인 (카테고리 필터)
├── banner/         — Banner 도메인
├── schedule/       — Schedule 도메인
└── youtube/        — YoutubeVideo 도메인
```

## API 엔드포인트

| 도메인 | 공개 | 관리자 |
|---|---|---|
| 인증 | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/reissue` | — |
| 사용자 | — | `GET /api/v1/admin/users`, `GET /api/v1/admin/users/search?email=` |
| 커뮤니티 | `GET /api/v1/communities`, `GET /api/v1/communities/{id}` | CRUD `/api/v1/admin/communities/**` |
| 게시글 | `GET /api/v1/posts`, `GET /api/v1/posts/{id}/comments` | — |
| 상품 | `GET /api/v1/products` (카테고리 필터) | `POST/PUT/DELETE/PATCH /api/v1/admin/products/**` |
| 배너 | `GET /api/v1/banners` | `POST/PUT/DELETE/PATCH /api/v1/admin/banners/**` |
| 방송일정 | `GET /api/v1/schedules` | `CRUD /api/v1/admin/schedules/**` |
| 유튜브 | `GET /api/v1/youtube` | `CRUD /api/v1/admin/youtube/**` |

API 접두사: `/api/v1/`

## 인증 흐름

```
OAuth2 로그인 (Google/Kakao/Naver)
  → CustomOAuth2UserService
  → OAuth2SuccessHandler (JWT 발급)
  → 프론트엔드 토큰 저장
  → JwtAuthenticationFilter (요청마다 검증)
  → 401 시 client.ts가 refresh token 재발급 시도
```

- 무상태 세션: `SessionCreationPolicy.STATELESS`
- 관리자 API 보호: `SecurityConfig`에서 `/api/v1/admin/**` → `hasRole("ADMIN")`. 컨트롤러에 추가로 `@PreAuthorize("hasRole('ADMIN')")` 적용

## 주요 기술 사항

- **테스트 DB**: H2 인메모리 (운영: MySQL 8.0). 테스트용 JWT_SECRET 별도 설정
- **QueryDSL**: 생성 소스 경로 `$buildDir/generated/querydsl`
- **API 표준 응답**: `ApiResponse<T>` — `{ success, data, message, timestamp }`

### Spring Security 6.x 주의사항

`permitAll()` 경로에 `/api/v1/communities/**` 외에 `/api/v1/communities` (루트 경로) **별도 명시 필수**.
`/**`는 루트 경로 자체를 매칭하지 않음.

### CORS 설정

`allowedOrigins`는 `CORS_ALLOWED_ORIGINS` 환경변수로 관리 (기본값: `http://localhost:3000,http://localhost`).
`SecurityConfig`와 `WebMvcConfig` 양쪽 모두 적용.

### Banner 컬럼

`Banner.imageUrl`은 `@Column(columnDefinition = "TEXT")` — base64 이미지 저장 가능.

### AdminUserController

`user/controller/AdminUserController.java`:
- `GET /api/v1/admin/users` — 전체 목록 + 페이지네이션
- `GET /api/v1/admin/users/search?email=` — 이메일 검색

`UserRepository`에 `findByEmailContainingIgnoreCase` 추가.
`admin/community/members/page.tsx`에서 실제 API 연동 완료 (mock 제거).

### 커뮤니티 권한 시스템 (백엔드 미구현)

- `User` 엔티티 `Role` enum에 `COMMUNITY_MODERATOR` 추가 예정
- 커뮤니티별 권한: `community_permission` 테이블 (`user_id`, `community_id`, `role`, `granted_by`)
- 글 작성 권한 체크에 `@communityPermissionService.hasModerator()` 조건 추가 필요
- 프론트엔드 UI 완료, 백엔드 API 연동은 Phase 2 과제
