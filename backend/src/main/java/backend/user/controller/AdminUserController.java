package backend.user.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.global.common.ApiResponse;
import backend.user.domain.User;
import backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    /**
     * 전체 유저 목록 조회 (페이지네이션)
     * GET /api/v1/admin/users?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<User> userPage = userRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", userPage.getContent().stream().map(this::toDto).toList());
        result.put("totalElements", userPage.getTotalElements());
        result.put("totalPages", userPage.getTotalPages());
        result.put("number", userPage.getNumber());
        result.put("size", userPage.getSize());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 이메일로 유저 검색
     * GET /api/v1/admin/users/search?email=...
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchByEmail(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // 이메일 포함 검색 (contains)
        Page<User> userPage = userRepository.findByEmailContainingIgnoreCase(
                email, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", userPage.getContent().stream().map(this::toDto).toList());
        result.put("totalElements", userPage.getTotalElements());
        result.put("totalPages", userPage.getTotalPages());
        result.put("number", userPage.getNumber());
        result.put("size", userPage.getSize());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private Map<String, Object> toDto(User user) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", user.getId());
        dto.put("email", user.getEmail());
        dto.put("nickname", user.getNickname());
        dto.put("role", user.getRole().name());
        dto.put("provider", user.getProvider() != null ? user.getProvider().name() : "LOCAL");
        dto.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return dto;
    }
}
