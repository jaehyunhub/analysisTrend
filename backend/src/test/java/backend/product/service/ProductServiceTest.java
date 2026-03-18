package backend.product.service;

import backend.product.domain.Product;
import backend.product.domain.ProductCategory;
import backend.product.dto.ProductResponse;
import backend.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("전체 상품 목록 조회 성공")
    void findAllProducts() {
        // given
        Product product = Product.builder()
                .name("테스트 상품")
                .price(10000)
                .category(ProductCategory.GOODS)
                .build();
        Page<Product> productPage = new PageImpl<>(List.of(product));

        given(productRepository.findAll(any(Pageable.class))).willReturn(productPage);

        // when
        Page<ProductResponse> result = productService.findAll(0, 10, null);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("테스트 상품");
    }

    @Test
    @DisplayName("카테고리 필터로 상품 조회 성공")
    void findProductsByCategory() {
        // given
        Product product = Product.builder()
                .name("의류 상품")
                .price(20000)
                .category(ProductCategory.FASHION)
                .build();
        Page<Product> productPage = new PageImpl<>(List.of(product));

        given(productRepository.findByCategory(eq(ProductCategory.FASHION), any(Pageable.class)))
                .willReturn(productPage);

        // when
        Page<ProductResponse> result = productService.findAll(0, 10, "FASHION");

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("ALL 카테고리로 조회 시 전체 목록 반환")
    void findAllProductsWithAllCategory() {
        // given
        Product p1 = Product.builder().name("상품1").price(1000).category(ProductCategory.GOODS).build();
        Product p2 = Product.builder().name("상품2").price(2000).category(ProductCategory.FOOD).build();
        Page<Product> productPage = new PageImpl<>(List.of(p1, p2));

        given(productRepository.findAll(any(Pageable.class))).willReturn(productPage);

        // when
        Page<ProductResponse> result = productService.findAll(0, 10, "ALL");

        // then
        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("category가 빈 문자열이면 전체 목록 반환")
    void findAllProductsWithBlankCategory() {
        // given
        Page<Product> productPage = new PageImpl<>(List.of());
        given(productRepository.findAll(any(Pageable.class))).willReturn(productPage);

        // when
        Page<ProductResponse> result = productService.findAll(0, 10, "");

        // then
        assertThat(result).isNotNull();
    }
}
