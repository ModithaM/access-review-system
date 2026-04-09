import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'accessify-theme';
const THEME_EVENT = 'accessify-theme-change';

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(nextTheme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', nextTheme === 'dark');
  window.localStorage.setItem(STORAGE_KEY, nextTheme);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: nextTheme }));
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY);
      if (!storedTheme) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      setTheme(customEvent.detail);
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener(THEME_EVENT, handleThemeChange as EventListener);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener(THEME_EVENT, handleThemeChange as EventListener);
    };
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  };
}
