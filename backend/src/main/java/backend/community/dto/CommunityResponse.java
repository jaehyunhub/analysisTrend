package backend.community.dto;

import backend.community.domain.Community;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityResponse {

    private Long id;
    private String name;
    private String description;
    private Long memberCount;
    private LocalDateTime createdAt;

    public static CommunityResponse from(Community community) {
        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .memberCount(community.getMemberCount())
                .createdAt(community.getCreatedAt())
                .build();
    }
}
