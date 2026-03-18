package backend.schedule.service;

import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import backend.schedule.domain.Schedule;
import backend.schedule.dto.ScheduleRequest;
import backend.schedule.dto.ScheduleResponse;
import backend.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public List<ScheduleResponse> findAll() {
        return scheduleRepository.findAllByOrderByScheduleDateAsc()
                .stream().map(ScheduleResponse::from).toList();
    }

    public List<ScheduleResponse> findByMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return scheduleRepository.findByScheduleDateBetweenOrderByScheduleDateAsc(start, end)
                .stream().map(ScheduleResponse::from).toList();
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        Schedule schedule = Schedule.builder()
                .title(request.getTitle())
                .scheduleDate(request.getScheduleDate())
                .type(request.getType())
                .description(request.getDescription())
                .build();
        return ScheduleResponse.from(scheduleRepository.save(schedule));
    }

    @Transactional
    public ScheduleResponse update(Long id, ScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        schedule.update(request.getTitle(), request.getScheduleDate(), request.getType(), request.getDescription());
        return ScheduleResponse.from(schedule);
    }

    @Transactional
    public void delete(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.ENTITY_NOT_FOUND);
        }
        scheduleRepository.deleteById(id);
    }
}
