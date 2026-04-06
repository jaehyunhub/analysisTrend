export type DetailBlock =
  | { type: 'image'; url: string }
  | { type: 'text'; content: string };

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountRate?: number;
  category: string;
  image?: string;
  imageUrl?: string;
  thumbnailImages?: string; // JSON array string of slider images
  badge?: string;
  isSoldOut: boolean;
  soldOut?: boolean;
  description?: string;
  detailContent?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: string[];
}

export interface Order {
  id: number;
  products: CartItem[];
  totalPrice: number;
  status: '배송준비중' | '배송중' | '배송완료' | '취소';
  createdAt: string;
}
