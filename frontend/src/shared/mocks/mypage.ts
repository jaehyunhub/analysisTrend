export interface OrderStat {
  label: string;
  count: number;
  icon: string;
}

export interface RecentOrder {
  id: number;
  orderNo: string;
  productName: string;
  orderedAt: string;
  price: string;
  status: string;
}

export interface CommunityActivity {
  type: string;
  title: string;
  time: string;
  karma: number;
  color: string;
}

export interface OrderItem {
  id: number;
  orderNo: string;
  orderedAt: string;
  productName: string;
  option: string;
  price: string;
  status: string;
}

export interface CommunityPost {
  id: number;
  board: string;
  title: string;
  postedAt: string;
  upvotes: number;
  comments: number;
}

export const MOCK_ORDER_STATS: OrderStat[] = [
  { label: '결제 대기', count: 0, icon: '💳' },
  { label: '처리 중', count: 1, icon: '📦' },
  { label: '배송 중', count: 2, icon: '🚚' },
  { label: '후기 필요', count: 5, icon: '✍️' },
];

export const MOCK_RECENT_ORDERS: RecentOrder[] = [
  {
    id: 1,
    orderNo: 'ORD-2026-001',
    productName: '프리미엄 기계식 키보드 키캡 세트',
    orderedAt: '2026년 2월 8일',
    price: '45,000원',
    status: '배송 중',
  },
  {
    id: 2,
    orderNo: 'ORD-2026-002',
    productName: '프리미엄 기계식 키보드 키캡 세트',
    orderedAt: '2026년 2월 9일',
    price: '45,000원',
    status: '배송 중',
  },
];

export const MOCK_COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  {
    type: '게시물',
    title: '2026년 AI 투자 트렌드 어떻게 보시나요?',
    time: '2시간 전',
    karma: 12,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    type: '댓글',
    title: '금리 인하 시대의 부동산 전략 게시물에 댓글',
    time: '5시간 전',
    karma: 3,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    type: '저장',
    title: 'React Server Components 완벽 가이드',
    time: '1일 전',
    karma: 0,
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  },
];

export const MOCK_ORDERS: OrderItem[] = [
  {
    id: 1,
    orderNo: 'ORD-2026-001',
    orderedAt: '2026년 2월 01일',
    productName: '무선 노이즈캔슬링 헤드폰',
    option: '색상: 블랙, 수량: 1',
    price: '299,000원',
    status: '배송 중',
  },
  {
    id: 2,
    orderNo: 'ORD-2026-002',
    orderedAt: '2026년 2월 02일',
    productName: '무선 노이즈캔슬링 헤드폰',
    option: '색상: 블랙, 수량: 1',
    price: '299,000원',
    status: '배송 중',
  },
  {
    id: 3,
    orderNo: 'ORD-2026-003',
    orderedAt: '2026년 2월 03일',
    productName: '무선 노이즈캔슬링 헤드폰',
    option: '색상: 블랙, 수량: 1',
    price: '299,000원',
    status: '배송 중',
  },
];

export const MOCK_MY_POSTS: CommunityPost[] = [
  {
    id: 1,
    board: '경제',
    title: '2026년 AI 트렌드 분석 및 2027년 전망',
    postedAt: '2일 전',
    upvotes: 152,
    comments: 45,
  },
  {
    id: 2,
    board: '경제',
    title: '2026년 AI 트렌드 분석 및 2027년 전망',
    postedAt: '2일 전',
    upvotes: 152,
    comments: 45,
  },
  {
    id: 3,
    board: '경제',
    title: '2026년 AI 트렌드 분석 및 2027년 전망',
    postedAt: '2일 전',
    upvotes: 152,
    comments: 45,
  },
  {
    id: 4,
    board: '경제',
    title: '2026년 AI 트렌드 분석 및 2027년 전망',
    postedAt: '2일 전',
    upvotes: 152,
    comments: 45,
  },
];
