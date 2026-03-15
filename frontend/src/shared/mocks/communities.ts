import type { Community } from '@/shared/types/community';

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 1,
    name: '경제',
    description: '경제·금융·투자 정보를 나누는 커뮤니티',
    memberCount: 120000,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    name: '방송',
    description: '채널 방송 관련 소식과 팬 활동 커뮤니티',
    memberCount: 85000,
    color: 'bg-red-500',
  },
  {
    id: 3,
    name: '쇼핑',
    description: '공동구매, 핫딜, 상품 추천 커뮤니티',
    memberCount: 60000,
    color: 'bg-orange-500',
  },
  {
    id: 4,
    name: '자유게시판',
    description: '자유롭게 이야기하는 커뮤니티',
    memberCount: 45000,
    color: 'bg-green-500',
  },
  {
    id: 5,
    name: 'KoreaIT',
    description: '국내 IT·스타트업 트렌드 커뮤니티',
    memberCount: 30000,
    color: 'bg-indigo-500',
  },
];

/** 커뮤니티 페이지 사이드바용 인기 커뮤니티 목록 */
export const POPULAR_COMMUNITIES = MOCK_COMMUNITIES.map((c, i) => ({
  rank: i + 1,
  name: c.name,
  slug: c.name,
  members: c.memberCount >= 10000 ? `${(c.memberCount / 10000).toFixed(1)}만` : `${c.memberCount}`,
  color: c.color ?? 'bg-gray-500',
  isJoined: i < 2,
}));
