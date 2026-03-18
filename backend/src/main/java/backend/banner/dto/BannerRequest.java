package backend.banner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BannerRequest {

    @NotBlank(message = "배너 제목은 필수입니다")
    private String title;

    private String subtitle;
    private String imageUrl;
    private boolean active;
    private int displayOrder;
}
