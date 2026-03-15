export interface User {
  id: number;
  email: string;
  nickname: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
