import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      theme: 'light',

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          document.documentElement.className = next;
        }
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.className = theme;
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 저장된 값 없으면 시스템 테마로 초기화
        if (!state?.theme) {
          const sys = getSystemTheme();
          state?.setTheme(sys);
        } else if (typeof document !== 'undefined') {
          document.documentElement.className = state.theme;
        }
      },
    }
  )
);
