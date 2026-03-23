import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { USE_MOCK_API } from '../api/mock/config';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  loginWithApi: (email: string, password: string) => Promise<void>;
  signupWithApi: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      // 직접 상태 세팅 (OAuth 콜백 / mock 로그인용)
      login: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      // 이메일/비밀번호 API 로그인
      loginWithApi: async (email, password) => {
        set({ isLoading: true });
        try {
          if (USE_MOCK_API) {
            // mock 모드: 더미 사용자로 로그인
            const mockUser: User = {
              id: 1,
              email,
              nickname: email.split('@')[0],
              role: 'USER',
              provider: 'LOCAL',
              createdAt: new Date().toISOString(),
            };
            get().login(mockUser, 'mock-access-token', 'mock-refresh-token');
            return;
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || '로그인에 실패했습니다.');
          }

          const json = await res.json();
          const data = json.data ?? json;

          const user: User = {
            id: data.id ?? 0,
            email: data.email ?? email,
            nickname: data.nickname ?? email.split('@')[0],
            role: data.role ?? 'USER',
            provider: data.provider ?? 'LOCAL',
            createdAt: data.createdAt ?? new Date().toISOString(),
          };

          get().login(user, data.accessToken, data.refreshToken);
        } finally {
          set({ isLoading: false });
        }
      },

      // 회원가입
      signupWithApi: async (email, password, nickname) => {
        set({ isLoading: true });
        try {
          if (USE_MOCK_API) {
            return; // mock 모드에서는 바로 성공
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/signup`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, nickname }),
            }
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || '회원가입에 실패했습니다.');
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),

      checkAuth: () => {
        const { accessToken } = get();
        return !!accessToken;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);

// 401 이벤트 리스너 등록 (client.ts에서 발생)
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
