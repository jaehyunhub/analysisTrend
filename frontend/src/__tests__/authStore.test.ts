import { useAuthStore } from '@/shared/model/authStore';

// sessionStorage mock (authStore는 sessionStorage 사용)
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

beforeEach(() => {
  sessionStorageMock.clear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('authStore', () => {
  const mockUser = { id: 1, email: 'test@example.com', nickname: 'tester', role: 'USER' as const };

  test('login: 상태 업데이트 + localStorage 저장', () => {
    useAuthStore.getState().login(mockUser, 'access-123', 'refresh-456');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-123');
    expect(state.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem('accessToken')).toBe('access-123');
    expect(sessionStorage.getItem('refreshToken')).toBe('refresh-456');
  });

  test('login: refreshToken 없이 호출해도 동작', () => {
    useAuthStore.getState().login(mockUser, 'access-only');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
  });

  test('logout: 상태 초기화 + localStorage 삭제', () => {
    useAuthStore.getState().login(mockUser, 'access-123', 'refresh-456');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
  });

  test('checkAuth: 토큰 있으면 true', () => {
    useAuthStore.getState().login(mockUser, 'access-123');
    expect(useAuthStore.getState().checkAuth()).toBe(true);
  });

  test('checkAuth: 토큰 없으면 false', () => {
    expect(useAuthStore.getState().checkAuth()).toBe(false);
  });

  test('loginWithApi: API 실패 시 isLoading이 false로 복귀', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network error'));
    await expect(useAuthStore.getState().loginWithApi('user@test.com', 'wrong')).rejects.toThrow();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
