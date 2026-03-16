package backend.post.dto;

import backend.post.domain.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private String authorNickname;
    private String communityName;
    private int upvotes;
    private int downvotes;
    private LocalDateTime createdAt;

    public static PostResponse from(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorNickname(post.getAuthor().getNickname())
                .communityName(post.getCommunity() != null ? post.getCommunity().getName() : null)
                .upvotes(post.getUpvotes())
                .downvotes(post.getDownvotes())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
