package backend.product.dto;

import backend.product.domain.ProductCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateProductRequest(
    @NotBlank String name,
    @Positive @NotNull Integer price,
    Integer originalPrice,
    Integer discount,
    @NotNull ProductCategory category,
    boolean isSoldOut,
    String imageUrl,
    String description,
    String detailContent
) {}
