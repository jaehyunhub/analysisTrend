package backend.schedule.domain;

import backend.global.baseEntity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "schedules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Schedule extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDate scheduleDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ScheduleType type = ScheduleType.REGULAR;

    @Column(length = 1000)
    private String description;

    public void update(String title, LocalDate scheduleDate, ScheduleType type, String description) {
        this.title = title;
        this.scheduleDate = scheduleDate;
        this.type = type;
        this.description = description;
    }
}
