package backend.post.repository;

import backend.post.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByCommunityId(Long communityId, Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.upvotes DESC")
    Page<Post> findAllOrderByUpvotes(Pageable pageable);
}
