package backend.schedule.dto;

import backend.schedule.domain.Schedule;
import backend.schedule.domain.ScheduleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private Long id;
    private String title;
    private LocalDate scheduleDate;
    private ScheduleType type;
    private String description;

    public static ScheduleResponse from(Schedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .title(schedule.getTitle())
                .scheduleDate(schedule.getScheduleDate())
                .type(schedule.getType())
                .description(schedule.getDescription())
                .build();
    }
}
