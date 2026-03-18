package backend.youtube.controller;

import backend.global.common.ApiResponse;
import backend.youtube.dto.YoutubeVideoRequest;
import backend.youtube.dto.YoutubeVideoResponse;
import backend.youtube.service.YoutubeVideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class YoutubeVideoController {

    private final YoutubeVideoService youtubeVideoService;

    /** 공개 API: 영상 목록 */
    @GetMapping("/api/v1/youtube")
    public ResponseEntity<ApiResponse<List<YoutubeVideoResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(youtubeVideoService.findAll()));
    }

    /** 관리자 API */
    @PostMapping("/api/v1/admin/youtube")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<YoutubeVideoResponse>> create(@Valid @RequestBody YoutubeVideoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(youtubeVideoService.create(request)));
    }

    @PutMapping("/api/v1/admin/youtube/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<YoutubeVideoResponse>> update(
            @PathVariable Long id, @Valid @RequestBody YoutubeVideoRequest request) {
        return ResponseEntity.ok(ApiResponse.success(youtubeVideoService.update(id, request)));
    }

    @DeleteMapping("/api/v1/admin/youtube/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        youtubeVideoService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
