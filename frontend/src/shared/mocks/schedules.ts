import type { Schedule, BroadcastNews } from '@/shared/types/schedule';

export const SCHEDULE_DAYS: string[] = ['일', '월', '화', '수', '목', '금', '토'];

/** 방송 예정일 (1-based 날짜 인덱스) */
export const BROADCAST_DATES: number[] = [3, 10, 14, 17, 24, 28];

export const MOCK_SCHEDULES: Schedule[] = [
  { id: 1, day: '화', title: '경제 이슈 라이브', time: '20:00', isLive: false },
  { id: 2, day: '토', title: '주간 경제 리포트', time: '15:00', isLive: false },
  { id: 3, day: '월', title: '트렌드 키워드 분석', time: '19:00', isLive: false },
  { id: 4, day: '목', title: '부동산 심층 분석', time: '21:00', isLive: false },
  { id: 5, day: '금', title: '금요 라이브 Q&A', time: '20:00', isLive: true },
];

export const MOCK_BROADCAST_NEWS: BroadcastNews[] = [
  {
    id: 1,
    title: '[공지] 3월 방송 일정 안내',
    content: '3월 방송 일정을 안내드립니다.',
    date: '03.14',
    category: '공지',
  },
  {
    id: 2,
    title: '이번 주 금요일 라이브 방송 예정',
    content: '이번 주 금요일 오후 8시 라이브 방송이 예정되어 있습니다.',
    date: '03.13',
    category: '방송',
  },
  {
    id: 3,
    title: '트렌드 분석 기능 업데이트 안내',
    content: '트렌드 분석 기능이 업데이트되었습니다.',
    date: '03.12',
    category: '업데이트',
  },
  {
    id: 4,
    title: '커뮤니티 이용 규칙 개정 안내',
    content: '커뮤니티 이용 규칙이 개정되었습니다.',
    date: '03.11',
    category: '공지',
  },
  {
    id: 5,
    title: '2월 이벤트 당첨자 발표',
    content: '2월 이벤트 당첨자를 발표합니다.',
    date: '03.10',
    category: '이벤트',
  },
];
