import { useAuthStore } from '@/shared/model/authStore';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
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
    expect(localStorage.getItem('accessToken')).toBe('access-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
  });

  test('login: refreshToken 없이 호출해도 동작', () => {
    useAuthStore.getState().login(mockUser, 'access-only');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  test('logout: 상태 초기화 + localStorage 삭제', () => {
    useAuthStore.getState().login(mockUser, 'access-123', 'refresh-456');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  test('checkAuth: 토큰 있으면 true', () => {
    useAuthStore.getState().login(mockUser, 'access-123');
    expect(useAuthStore.getState().checkAuth()).toBe(true);
  });

  test('checkAuth: 토큰 없으면 false', () => {
    expect(useAuthStore.getState().checkAuth()).toBe(false);
  });

  test('loginWithApi (mock 모드): 더미 유저로 로그인', async () => {
    jest.mock('@/shared/api/mock/config', () => ({ USE_MOCK_API: true }));
    await useAuthStore.getState().loginWithApi('user@test.com', 'password123');
    // mock 모드에서는 에러 없이 완료
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
