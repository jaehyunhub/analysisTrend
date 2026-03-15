package backend.community.controller;

import backend.community.dto.CommunityResponse;
import backend.community.dto.CreateCommunityRequest;
import backend.community.service.CommunityService;
import backend.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(communityService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(communityService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommunityResponse>> create(
            @Valid @RequestBody CreateCommunityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(communityService.create(request), "커뮤니티가 생성되었습니다."));
    }
}
