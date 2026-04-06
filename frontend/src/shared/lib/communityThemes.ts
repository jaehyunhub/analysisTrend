// 커뮤니티 테마 — board 페이지 & 상세 페이지 공통 사용
export interface CommunityTheme {
  gradient: string;       // 배너·아이콘 그라디언트
  btnBg: string;          // 주 버튼 배경
  btnHover: string;       // 주 버튼 호버
  borderColor: string;    // 아웃라인 버튼 테두리
  textColor: string;      // 강조 텍스트
  lightBg: string;        // 연한 배경 (뱃지·탭 활성)
  lightText: string;      // 연한 배경 위 텍스트
  focusBorder: string;    // textarea 포커스 테두리
  threadHover: string;    // 댓글 스레드 라인 호버
  sortActiveBg: string;   // 댓글 정렬 활성 버튼 배경
  ruleNumberColor: string; // 커뮤니티 규칙 번호 색
}

const THEMES: Record<string, CommunityTheme> = {
  // ── 고정 카테고리 ──────────────────────────────────────
  '경제': {
    gradient:        'from-blue-600 to-blue-400',
    btnBg:           'bg-blue-600',
    btnHover:        'hover:bg-blue-700',
    borderColor:     'border-blue-600',
    textColor:       'text-blue-600',
    lightBg:         'bg-blue-50 dark:bg-blue-900/30',
    lightText:       'text-blue-600 dark:text-blue-400',
    focusBorder:     'focus-within:border-blue-400 dark:focus-within:border-blue-500',
    threadHover:     'hover:bg-blue-400 dark:hover:bg-blue-500',
    sortActiveBg:    'bg-blue-600',
    ruleNumberColor: 'text-blue-500',
  },
  '방송': {
    gradient:        'from-red-600 to-rose-400',
    btnBg:           'bg-red-600',
    btnHover:        'hover:bg-red-700',
    borderColor:     'border-red-600',
    textColor:       'text-red-600',
    lightBg:         'bg-red-50 dark:bg-red-900/30',
    lightText:       'text-red-600 dark:text-red-400',
    focusBorder:     'focus-within:border-red-400 dark:focus-within:border-red-500',
    threadHover:     'hover:bg-red-400 dark:hover:bg-red-500',
    sortActiveBg:    'bg-red-600',
    ruleNumberColor: 'text-red-500',
  },
  '쇼핑': {
    gradient:        'from-orange-500 to-amber-400',
    btnBg:           'bg-orange-500',
    btnHover:        'hover:bg-orange-600',
    borderColor:     'border-orange-500',
    textColor:       'text-orange-500',
    lightBg:         'bg-orange-50 dark:bg-orange-900/30',
    lightText:       'text-orange-500 dark:text-orange-400',
    focusBorder:     'focus-within:border-orange-400 dark:focus-within:border-orange-500',
    threadHover:     'hover:bg-orange-400 dark:hover:bg-orange-500',
    sortActiveBg:    'bg-orange-500',
    ruleNumberColor: 'text-orange-500',
  },
  '자유게시판': {
    gradient:        'from-green-600 to-emerald-400',
    btnBg:           'bg-green-600',
    btnHover:        'hover:bg-green-700',
    borderColor:     'border-green-600',
    textColor:       'text-green-600',
    lightBg:         'bg-green-50 dark:bg-green-900/30',
    lightText:       'text-green-600 dark:text-green-400',
    focusBorder:     'focus-within:border-green-400 dark:focus-within:border-green-500',
    threadHover:     'hover:bg-green-400 dark:hover:bg-green-500',
    sortActiveBg:    'bg-green-600',
    ruleNumberColor: 'text-green-500',
  },

  // ── 커스텀 커뮤니티 ────────────────────────────────────
  '슈카': {
    gradient:        'from-blue-600 to-sky-400',
    btnBg:           'bg-blue-600',
    btnHover:        'hover:bg-blue-700',
    borderColor:     'border-blue-600',
    textColor:       'text-blue-600',
    lightBg:         'bg-blue-50 dark:bg-blue-900/30',
    lightText:       'text-blue-600 dark:text-blue-400',
    focusBorder:     'focus-within:border-blue-400 dark:focus-within:border-blue-500',
    threadHover:     'hover:bg-blue-400 dark:hover:bg-blue-500',
    sortActiveBg:    'bg-blue-600',
    ruleNumberColor: 'text-blue-500',
  },
  '알상무': {
    gradient:        'from-red-600 to-rose-400',
    btnBg:           'bg-red-600',
    btnHover:        'hover:bg-red-700',
    borderColor:     'border-red-600',
    textColor:       'text-red-600',
    lightBg:         'bg-red-50 dark:bg-red-900/30',
    lightText:       'text-red-600 dark:text-red-400',
    focusBorder:     'focus-within:border-red-400 dark:focus-within:border-red-500',
    threadHover:     'hover:bg-red-400 dark:hover:bg-red-500',
    sortActiveBg:    'bg-red-600',
    ruleNumberColor: 'text-red-500',
  },
  '미장은지금': {
    gradient:        'from-orange-500 to-amber-400',
    btnBg:           'bg-orange-500',
    btnHover:        'hover:bg-orange-600',
    borderColor:     'border-orange-500',
    textColor:       'text-orange-500',
    lightBg:         'bg-orange-50 dark:bg-orange-900/30',
    lightText:       'text-orange-500 dark:text-orange-400',
    focusBorder:     'focus-within:border-orange-400 dark:focus-within:border-orange-500',
    threadHover:     'hover:bg-orange-400 dark:hover:bg-orange-500',
    sortActiveBg:    'bg-orange-500',
    ruleNumberColor: 'text-orange-500',
  },
  '바이킹스': {
    gradient:        'from-green-600 to-emerald-400',
    btnBg:           'bg-green-600',
    btnHover:        'hover:bg-green-700',
    borderColor:     'border-green-600',
    textColor:       'text-green-600',
    lightBg:         'bg-green-50 dark:bg-green-900/30',
    lightText:       'text-green-600 dark:text-green-400',
    focusBorder:     'focus-within:border-green-400 dark:focus-within:border-green-500',
    threadHover:     'hover:bg-green-400 dark:hover:bg-green-500',
    sortActiveBg:    'bg-green-600',
    ruleNumberColor: 'text-green-500',
  },
  '박팀장': {
    gradient:        'from-indigo-600 to-violet-400',
    btnBg:           'bg-indigo-600',
    btnHover:        'hover:bg-indigo-700',
    borderColor:     'border-indigo-600',
    textColor:       'text-indigo-600',
    lightBg:         'bg-indigo-50 dark:bg-indigo-900/30',
    lightText:       'text-indigo-600 dark:text-indigo-400',
    focusBorder:     'focus-within:border-indigo-400 dark:focus-within:border-indigo-500',
    threadHover:     'hover:bg-indigo-400 dark:hover:bg-indigo-500',
    sortActiveBg:    'bg-indigo-600',
    ruleNumberColor: 'text-indigo-500',
  },
  '주식은지금': {
    gradient:        'from-teal-600 to-cyan-400',
    btnBg:           'bg-teal-600',
    btnHover:        'hover:bg-teal-700',
    borderColor:     'border-teal-600',
    textColor:       'text-teal-600',
    lightBg:         'bg-teal-50 dark:bg-teal-900/30',
    lightText:       'text-teal-600 dark:text-teal-400',
    focusBorder:     'focus-within:border-teal-400 dark:focus-within:border-teal-500',
    threadHover:     'hover:bg-teal-400 dark:hover:bg-teal-500',
    sortActiveBg:    'bg-teal-600',
    ruleNumberColor: 'text-teal-500',
  },
  '니니': {
    gradient:        'from-pink-500 to-rose-300',
    btnBg:           'bg-pink-500',
    btnHover:        'hover:bg-pink-600',
    borderColor:     'border-pink-500',
    textColor:       'text-pink-500',
    lightBg:         'bg-pink-50 dark:bg-pink-900/30',
    lightText:       'text-pink-500 dark:text-pink-400',
    focusBorder:     'focus-within:border-pink-400 dark:focus-within:border-pink-500',
    threadHover:     'hover:bg-pink-400 dark:hover:bg-pink-500',
    sortActiveBg:    'bg-pink-500',
    ruleNumberColor: 'text-pink-500',
  },
};

// 정의되지 않은 커뮤니티 기본값 (보라색)
export const DEFAULT_THEME: CommunityTheme = {
  gradient:        'from-purple-600 to-violet-400',
  btnBg:           'bg-purple-600',
  btnHover:        'hover:bg-purple-700',
  borderColor:     'border-purple-600',
  textColor:       'text-purple-600',
  lightBg:         'bg-purple-50 dark:bg-purple-900/30',
  lightText:       'text-purple-600 dark:text-purple-400',
  focusBorder:     'focus-within:border-purple-400 dark:focus-within:border-purple-500',
  threadHover:     'hover:bg-purple-400 dark:hover:bg-purple-500',
  sortActiveBg:    'bg-purple-600',
  ruleNumberColor: 'text-purple-500',
};

export function getCommunityTheme(slug: string): CommunityTheme {
  return THEMES[slug] ?? DEFAULT_THEME;
}
