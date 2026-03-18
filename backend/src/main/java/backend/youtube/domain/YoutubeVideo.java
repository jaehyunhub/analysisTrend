package backend.youtube.domain;

import backend.global.baseEntity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "youtube_videos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class YoutubeVideo extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String videoId;

    private String thumbnailUrl;
    private String duration;
    private String viewCount;

    @Column(nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    public void update(String title, String videoId, String thumbnailUrl, String duration, String viewCount, int displayOrder) {
        this.title = title;
        this.videoId = videoId;
        this.thumbnailUrl = thumbnailUrl;
        this.duration = duration;
        this.viewCount = viewCount;
        this.displayOrder = displayOrder;
    }
}
