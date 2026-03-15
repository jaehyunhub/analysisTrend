import type { Product } from '@/shared/types/shop';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'AnalysisTrend 공식 후드티',
    price: 55000,
    category: 'GOODS',
    image: 'bg-gray-300',
    badge: 'NEW',
    isSoldOut: false,
  },
  {
    id: 2,
    name: '제주 흑돼지 특선 세트 (500g)',
    price: 45000,
    category: 'FOOD',
    image: 'bg-red-200',
    badge: 'BEST',
    isSoldOut: false,
  },
  {
    id: 3,
    name: 'AnalysisTrend 한정판 후드티',
    price: 65000,
    category: 'FASHION',
    image: 'bg-blue-200',
    badge: 'HOT',
    isSoldOut: true,
  },
  {
    id: 4,
    name: 'AnalysisTrend 로고 캡',
    price: 25000,
    category: 'FASHION',
    image: 'bg-green-200',
    badge: '',
    isSoldOut: false,
  },
  {
    id: 5,
    name: '커스텀 키캡 세트',
    price: 39000,
    category: 'DIGITAL',
    image: 'bg-purple-200',
    badge: '',
    isSoldOut: false,
  },
  {
    id: 6,
    name: '채널 공식 머그컵',
    price: 18000,
    category: 'GOODS',
    image: 'bg-yellow-200',
    badge: 'NEW',
    isSoldOut: false,
  },
  {
    id: 7,
    name: '프리미엄 마우스패드',
    price: 29000,
    category: 'DIGITAL',
    image: 'bg-indigo-200',
    badge: '',
    isSoldOut: false,
  },
  {
    id: 8,
    name: '유기농 꿀 선물세트',
    price: 35000,
    category: 'FOOD',
    image: 'bg-orange-200',
    badge: 'BEST',
    isSoldOut: false,
  },
];

export const PRODUCT_CATEGORIES = [
  { key: 'ALL', label: '전체' },
  { key: 'GOODS', label: '굿즈' },
  { key: 'FOOD', label: '식품' },
  { key: 'FASHION', label: '패션' },
  { key: 'DIGITAL', label: '디지털' },
] as const;

/** 메인 페이지 쇼핑몰 미리보기용 상품 (상위 4개) */
export const SHOP_PREVIEW_ITEMS = [
  {
    id: 1,
    title: '공식 후드티 (블랙/화이트)',
    price: '55,000원',
    badge: '20% 할인',
    image: 'bg-gray-200',
  },
  {
    id: 2,
    title: '트렌드 분석 구독권 (월 1회)',
    price: '29,000원',
    badge: 'HOT',
    image: 'bg-purple-200',
  },
  {
    id: 3,
    title: '스트리머 입문 세트',
    price: '199,000원',
    badge: 'NEW',
    image: 'bg-blue-200',
  },
  {
    id: 4,
    title: 'AnalysisTrend 커스텀 키캡',
    price: '39,000원',
    badge: '',
    image: 'bg-pink-200',
  },
];
