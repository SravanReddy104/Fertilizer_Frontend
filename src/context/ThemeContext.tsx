import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
const THEME_KEY = 'fs_theme';

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light';
    setModeState(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(THEME_KEY, m);
    document.documentElement.setAttribute('data-theme', m);
  };

  const toggle = () => setMode(mode === 'light' ? 'dark' : 'light');

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
