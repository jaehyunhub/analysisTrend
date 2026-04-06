import type { Product } from '@/shared/types/shop';
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
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (category && category !== 'ALL') params.set('category', category);

  return apiGet<ProductListResponse>(`/api/v1/products?${params}`);
}

export async function getProductById(id: number): Promise<Product> {
  return apiGet<Product>(`/api/v1/products/${id}`);
}
