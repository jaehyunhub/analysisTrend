package backend.product.service;

import backend.global.exception.BusinessException;
import backend.global.exception.ErrorCode;
import backend.product.domain.Product;
import backend.product.domain.ProductCategory;
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
}
