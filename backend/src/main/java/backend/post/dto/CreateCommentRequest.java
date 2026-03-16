package backend.post.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CreateCommentRequest {

    @NotBlank(message = "댓글 내용을 입력하세요.")
    private String content;

    private Long parentCommentId;
}
