package backend.post.domain;

import backend.community.domain.Community;
import backend.global.baseEntity.BaseTimeEntity;
import backend.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Post extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @Builder.Default
    private int upvotes = 0;

    @Builder.Default
    private int downvotes = 0;

    public void upvote() { this.upvotes++; }
    public void downvote() { this.downvotes++; }
    public void cancelUpvote() { if (this.upvotes > 0) this.upvotes--; }
    public void cancelDownvote() { if (this.downvotes > 0) this.downvotes--; }
}
