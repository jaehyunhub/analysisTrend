package backend.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CreateCommunityRequest {

    @NotBlank(message = "커뮤니티 이름을 입력하세요.")
    @Size(min = 2, max = 50, message = "커뮤니티 이름은 2~50자여야 합니다.")
    private String name;

    @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
    private String description;
}
