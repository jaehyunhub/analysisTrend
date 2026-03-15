export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  image: string;
  badge?: string;
  isSoldOut: boolean;
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
