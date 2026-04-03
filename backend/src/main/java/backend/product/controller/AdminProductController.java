package backend.product.controller;

import backend.global.common.ApiResponse;
import backend.product.dto.CreateProductRequest;
import backend.product.dto.ProductResponse;
import backend.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(productService.create(request), "상품이 등록되었습니다."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "상품이 삭제되었습니다."));
    }

    @PatchMapping("/{id}/sold-out")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleSoldOut(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.toggleSoldOut(id)));
    }
}
