package backend.product.dto;

import backend.product.domain.Product;
import backend.product.domain.ProductCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private int price;
    private Integer originalPrice;
    private Integer discount;
    private ProductCategory category;
    private boolean isSoldOut;
    private String imageUrl;
    private String thumbnailImages;
    private String description;
    private String detailContent;

    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discount(product.getDiscount())
                .category(product.getCategory())
                .isSoldOut(product.isSoldOut())
                .imageUrl(product.getImageUrl())
                .thumbnailImages(product.getThumbnailImages())
                .description(product.getDescription())
                .detailContent(product.getDetailContent())
                .build();
    }
}
