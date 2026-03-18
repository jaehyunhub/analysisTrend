package backend.youtube.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class YoutubeVideoRequest {

    @NotBlank(message = "영상 제목은 필수입니다")
    private String title;

    @NotBlank(message = "YouTube 영상 ID는 필수입니다")
    private String videoId;

    private String thumbnailUrl;
    private String duration;
    private String viewCount;
    private int displayOrder;
}
