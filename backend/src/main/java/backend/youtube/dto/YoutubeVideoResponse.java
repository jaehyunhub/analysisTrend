package backend.youtube.dto;

import backend.youtube.domain.YoutubeVideo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class YoutubeVideoResponse {

    private Long id;
    private String title;
    private String videoId;
    private String thumbnailUrl;
    private String duration;
    private String viewCount;
    private int displayOrder;

    public static YoutubeVideoResponse from(YoutubeVideo video) {
        return YoutubeVideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .videoId(video.getVideoId())
                .thumbnailUrl(video.getThumbnailUrl())
                .duration(video.getDuration())
                .viewCount(video.getViewCount())
                .displayOrder(video.getDisplayOrder())
                .build();
    }
}
