package backend.banner.dto;

import backend.banner.domain.Banner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {

    private Long id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private boolean active;
    private int displayOrder;
    private LocalDateTime createdAt;

    public static BannerResponse from(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .active(banner.isActive())
                .displayOrder(banner.getDisplayOrder())
                .createdAt(banner.getCreatedAt())
                .build();
    }
}
