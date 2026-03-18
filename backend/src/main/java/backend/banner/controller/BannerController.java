package backend.banner.controller;

import backend.banner.dto.BannerRequest;
import backend.banner.dto.BannerResponse;
import backend.banner.service.BannerService;
import backend.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    /** 공개 API: 활성 배너 목록 (메인 페이지용) */
    @GetMapping("/api/v1/banners")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.findActive()));
    }

    /** 관리자 API */
    @GetMapping("/api/v1/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.findAll()));
    }

    @PostMapping("/api/v1/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BannerResponse>> create(@Valid @RequestBody BannerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(bannerService.create(request)));
    }

    @PutMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BannerResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bannerService.update(id, request)));
    }

    @DeleteMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/api/v1/admin/banners/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BannerResponse>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bannerService.toggleActive(id)));
    }
}
