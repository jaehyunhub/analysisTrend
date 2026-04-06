package backend.product.service;

import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import backend.product.domain.Product;
import backend.product.domain.ProductCategory;
import backend.product.dto.CreateProductRequest;
import backend.product.dto.ProductResponse;
import backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> findAll(int page, int size, String category) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            ProductCategory productCategory = ProductCategory.valueOf(category.toUpperCase());
            return productRepository.findByCategory(productCategory, pageRequest).map(ProductResponse::from);
        }
        return productRepository.findAll(pageRequest).map(ProductResponse::from);
    }

    public ProductResponse findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.name())
                .price(request.price())
                .originalPrice(request.originalPrice())
                .discount(request.discount())
                .category(request.category())
                .isSoldOut(request.isSoldOut())
                .imageUrl(request.imageUrl())
                .thumbnailImages(request.thumbnailImages())
                .description(request.description())
                .detailContent(request.detailContent())
                .build();
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        product.update(request.name(), request.price(), request.originalPrice(), request.discount(),
                request.category(), request.isSoldOut(), request.imageUrl(), request.thumbnailImages(), request.description(), request.detailContent());
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse toggleSoldOut(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        product.update(product.getName(), product.getPrice(), product.getOriginalPrice(), product.getDiscount(),
                product.getCategory(), !product.isSoldOut(), product.getImageUrl(), product.getThumbnailImages(), product.getDescription(), product.getDetailContent());
        return ProductResponse.from(product);
    }
}
