package backend.schedule.controller;

import backend.global.common.ApiResponse;
import backend.schedule.dto.ScheduleRequest;
import backend.schedule.dto.ScheduleResponse;
import backend.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /** 공개 API: 이번 달 일정 */
    @GetMapping("/api/v1/schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getThisMonth() {
        LocalDate now = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(scheduleService.findByMonth(now.getYear(), now.getMonthValue())));
    }

    @GetMapping("/api/v1/schedules/month")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getByMonth(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.findByMonth(year, month)));
    }

    /** 관리자 API */
    @GetMapping("/api/v1/admin/schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.findAll()));
    }

    @PostMapping("/api/v1/admin/schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleResponse>> create(@Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.create(request)));
    }

    @PutMapping("/api/v1/admin/schedules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.update(id, request)));
    }

    @DeleteMapping("/api/v1/admin/schedules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
