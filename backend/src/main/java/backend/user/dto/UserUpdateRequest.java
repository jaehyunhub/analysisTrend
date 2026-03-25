package backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @NotBlank(message = "닉네임은 비워둘 수 없습니다")
    @Size(min = 2, max = 20, message = "닉네임은 2~20자여야 합니다")
    String nickname
) {}
