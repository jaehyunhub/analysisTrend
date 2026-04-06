package backend.post.repository;

import backend.post.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndParentCommentIsNull(Long postId);
    List<Comment> findByPostId(Long postId);
    long countByPostId(Long postId);
    void deleteByPostId(Long postId);
}
