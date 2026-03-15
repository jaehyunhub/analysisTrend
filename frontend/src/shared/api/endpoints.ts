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
