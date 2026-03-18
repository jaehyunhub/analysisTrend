package backend.youtube.repository;

import backend.youtube.domain.YoutubeVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface YoutubeVideoRepository extends JpaRepository<YoutubeVideo, Long> {
    List<YoutubeVideo> findAllByOrderByDisplayOrderAsc();
}
