import type { Post } from '@/shared/types/post';

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    title: '미국 관세 인상이 국내 수출 기업에 미치는 실질적 영향 분석',
    content:
      '트럼프 행정부의 관세 정책이 본격화되면서 삼성, LG, 현대차 등 주요 수출 기업의 실적에 직접적인 영향이 예상됩니다. 특히 반도체와 자동차 분야에서...',
    author: 'trend_master',
    community: '경제',
    upvotes: 1200,
    downvotes: 45,
    commentCount: 89,
    createdAt: '2026-03-15T08:00:00Z',
    tags: ['관세', '수출', '경제'],
  },
  {
    id: 2,
    title: '이번 주 금요일 라이브 방송 주제 미리 예고해드립니다',
    content:
      '이번 주 금요일 오후 8시 라이브 방송에서는 2분기 경제 전망과 부동산 시장 분석을 다룰 예정입니다. 채팅으로 질문 주시면 실시간으로 답변 드리겠습니다...',
    author: 'broadcast_fan',
    community: '방송',
    upvotes: 3400,
    downvotes: 12,
    commentCount: 256,
    createdAt: '2026-03-15T06:00:00Z',
    tags: ['라이브', '방송', '경제전망'],
  },
  {
    id: 3,
    title: '네이버·카카오 검색 기준 오늘의 급상승 키워드 분석',
    content:
      "'제로금리', 'ETF', '리츠' 등 투자 관련 키워드가 급상승 중입니다. 최근 금리 인하 기대감이 높아지면서 관련 투자 상품에 대한 관심이 폭발적으로 증가...",
    author: 'seoul_investor',
    community: '경제',
    upvotes: 856,
    downvotes: 30,
    commentCount: 42,
    createdAt: '2026-03-15T05:00:00Z',
    tags: ['키워드', 'ETF', '금리'],
  },
];
