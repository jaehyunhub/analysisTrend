package backend.schedule.repository;

import backend.schedule.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findAllByOrderByScheduleDateAsc();
    List<Schedule> findByScheduleDateBetweenOrderByScheduleDateAsc(LocalDate start, LocalDate end);
}
