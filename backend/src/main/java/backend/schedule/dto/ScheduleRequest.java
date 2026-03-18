package backend.schedule.dto;

import backend.schedule.domain.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class ScheduleRequest {

    @NotBlank(message = "일정 제목은 필수입니다")
    private String title;

    @NotNull(message = "일정 날짜는 필수입니다")
    private LocalDate scheduleDate;

    private ScheduleType type = ScheduleType.REGULAR;
    private String description;
}
