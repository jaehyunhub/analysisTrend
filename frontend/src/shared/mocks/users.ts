import type { User } from '@/shared/types/user';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'jaehyun@example.com',
    nickname: '김재현',
    role: 'USER',
    provider: 'GOOGLE',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'admin@analysistrend.com',
    nickname: '관리자',
    role: 'ADMIN',
    provider: 'LOCAL',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 3,
    email: 'trend_master@example.com',
    nickname: 'trend_master',
    role: 'USER',
    provider: 'KAKAO',
    createdAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 4,
    email: 'seoul_investor@example.com',
    nickname: 'seoul_investor',
    role: 'USER',
    provider: 'NAVER',
    createdAt: '2025-05-20T00:00:00Z',
  },
];
