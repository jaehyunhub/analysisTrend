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
  { label: '처리 중', count: 0, icon: '📦' },
  { label: '배송 중', count: 0, icon: '🚚' },
  { label: '후기 필요', count: 0, icon: '✍️' },
];

export const MOCK_RECENT_ORDERS: RecentOrder[] = [];

export const MOCK_COMMUNITY_ACTIVITIES: CommunityActivity[] = [];

export const MOCK_ORDERS: OrderItem[] = [];

export const MOCK_MY_POSTS: CommunityPost[] = [];
