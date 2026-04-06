package backend.post.controller;

import backend.global.common.ApiResponse;
import backend.post.dto.*;
import backend.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "new") String sort) {
        return ResponseEntity.ok(ApiResponse.success(postService.findAll(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(postService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> create(
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(postService.create(request, userDetails.getUsername()), "게시글이 작성되었습니다."));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<ApiResponse<PostResponse>> vote(
            @PathVariable Long id,
            @RequestBody(required = false) backend.post.dto.VoteRequest body,
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal UserDetails userDetails) {
        String voteType = (body != null && body.getVoteType() != null) ? body.getVoteType() : type;
        return ResponseEntity.ok(ApiResponse.success(postService.vote(id, voteType, userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        postService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "게시글이 삭제되었습니다."));
    }
}
