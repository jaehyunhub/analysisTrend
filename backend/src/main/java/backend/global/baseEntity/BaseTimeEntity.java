package backend.global.baseEntity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

@Getter
@MappedSuperclass // 이 클래스는 테이블을 만들지 않고, 상속받는 자식에게만 컬럼만 물려줘라
@EntityListeners(AuditingEntityListener.class) // 시간에 대한 변화를 감지
public class BaseTimeEntity {

    @CreatedDate // 생성될 때 시간 자동 저장
    @Column(updatable = false) // 생성 시간은 수정되면 안됨
    private LocalDateTime createdAt;

    @LastModifiedBy // 수정될 때 시간 자동 업데이트
    private LocalDateTime updatedAt;

}
