export const AUTH = {
  LOGIN: '/api/v1/auth/login',
  SIGNUP: '/api/v1/auth/signup',
  REISSUE: '/api/v1/auth/reissue',
  ME: '/api/v1/auth/me',
} as const;

export const COMMUNITIES = {
  LIST: '/api/v1/communities',
  DETAIL: (id: number) => `/api/v1/communities/${id}`,
} as const;

export const POSTS = {
  LIST: '/api/v1/posts',
  DETAIL: (id: number) => `/api/v1/posts/${id}`,
  VOTE: (id: number) => `/api/v1/posts/${id}/vote`,
  COMMENTS: (id: number) => `/api/v1/posts/${id}/comments`,
} as const;

export const PRODUCTS = {
  LIST: '/api/v1/products',
  DETAIL: (id: number) => `/api/v1/products/${id}`,
} as const;

export const BANNERS = {
  LIST: '/api/v1/banners',
  ADMIN_LIST: '/api/v1/admin/banners',
  ADMIN_DETAIL: (id: number) => `/api/v1/admin/banners/${id}`,
  ADMIN_TOGGLE: (id: number) => `/api/v1/admin/banners/${id}/toggle`,
} as const;

export const SCHEDULES = {
  THIS_MONTH: '/api/v1/schedules',
  BY_MONTH: (year: number, month: number) => `/api/v1/schedules/month?year=${year}&month=${month}`,
  ADMIN_LIST: '/api/v1/admin/schedules',
  ADMIN_DETAIL: (id: number) => `/api/v1/admin/schedules/${id}`,
} as const;

export const YOUTUBE = {
  LIST: '/api/v1/youtube',
  ADMIN_CREATE: '/api/v1/admin/youtube',
  ADMIN_DETAIL: (id: number) => `/api/v1/admin/youtube/${id}`,
} as const;

export const USERS = {
  ME: '/api/v1/users/me',
} as const;

export const ADMIN = {
  MEMBERS: '/api/v1/admin/members',
  POSTS: '/api/v1/admin/posts',
} as const;

export const ANALYSIS = {
  CHAT_UPLOAD: '/analyze/chat',
  CHAT_SESSION: (id: string) => `/analyze/chat/session/${id}`,
  TRENDS_NEWS: '/trends/news',
  TRENDS_YOUTUBE: '/trends/youtube',
  TRENDS_KEYWORDS: '/trends/keywords',
} as const;
