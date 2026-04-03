package backend.banner.domain;

import backend.global.baseEntity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banners")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Banner extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = false;

    @Column(nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    public void update(String title, String subtitle, String imageUrl, boolean active, int displayOrder) {
        this.title = title;
        this.subtitle = subtitle;
        this.imageUrl = imageUrl;
        this.active = active;
        this.displayOrder = displayOrder;
    }

    public void toggleActive() {
        this.active = !this.active;
    }
}
