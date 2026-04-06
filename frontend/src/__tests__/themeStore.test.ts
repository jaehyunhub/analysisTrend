import { useThemeStore } from '@/shared/model/themeStore';

beforeEach(() => {
  useThemeStore.setState({ theme: 'light' });
  document.documentElement.className = '';
});

describe('themeStore', () => {
  test('초기 테마는 light', () => {
    expect(useThemeStore.getState().theme).toBe('light');
  });

  test('toggleTheme: light → dark', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  test('toggleTheme: dark → light', () => {
    useThemeStore.setState({ theme: 'dark' });
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  test('toggleTheme: document.documentElement.className 업데이트', () => {
    useThemeStore.getState().toggleTheme();
    expect(document.documentElement.className).toBe('dark');
  });

  test('setTheme: dark 설정', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.className).toBe('dark');
  });

  test('setTheme: light 복원', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
