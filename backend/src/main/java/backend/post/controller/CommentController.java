package backend.post.controller;

import backend.global.common.ApiResponse;
import backend.post.dto.CommentResponse;
import backend.post.dto.CreateCommentRequest;
import backend.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> findComments(@PathVariable Long postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.findComments(postId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        postService.addComment(postId, request, userDetails.getUsername()),
                        "댓글이 작성되었습니다."));
    }
}
