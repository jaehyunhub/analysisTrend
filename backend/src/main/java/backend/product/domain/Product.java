package backend.product.domain;

import backend.global.baseEntity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int price;

    private Integer originalPrice;

    private Integer discount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Builder.Default
    private boolean isSoldOut = false;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String thumbnailImages;

    private String description;

    @Column(columnDefinition = "TEXT")
    private String detailContent;

    public void update(String name, int price, Integer originalPrice, Integer discount, ProductCategory category, boolean isSoldOut, String imageUrl, String thumbnailImages, String description, String detailContent) {
        this.name = name;
        this.price = price;
        this.originalPrice = originalPrice;
        this.discount = discount;
        this.category = category;
        this.isSoldOut = isSoldOut;
        this.imageUrl = imageUrl;
        this.thumbnailImages = thumbnailImages;
        this.description = description;
        this.detailContent = detailContent;
    }
}
