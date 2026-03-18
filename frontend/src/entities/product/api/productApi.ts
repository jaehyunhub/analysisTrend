import type { Product } from '@/shared/types/shop';
import { USE_MOCK_API } from '@/shared/api/mock/config';
import { MOCK_PRODUCTS } from '@/shared/mocks/products';
import { apiGet } from '@/shared/api/client';

interface ProductListResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function getProducts(
  category?: string,
  page = 0,
  size = 20
): Promise<ProductListResponse> {
  if (USE_MOCK_API) {
    const filtered = category && category !== 'ALL'
      ? MOCK_PRODUCTS.filter((p) => p.category === category)
      : MOCK_PRODUCTS;
    return {
      content: filtered,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      number: page,
      size,
    };
  }

  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (category && category !== 'ALL') params.set('category', category);

  return apiGet<ProductListResponse>(`/api/v1/products?${params}`);
}

export async function getProductById(id: number): Promise<Product> {
  if (USE_MOCK_API) {
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) throw new Error('상품을 찾을 수 없습니다.');
    return product;
  }

  return apiGet<Product>(`/api/v1/products/${id}`);
}
