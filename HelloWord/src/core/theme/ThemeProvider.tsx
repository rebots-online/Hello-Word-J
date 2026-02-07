import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'minimal' | 'kinetic' | 'brutalist' | 'retro' | 'neumorphism' | 'glassmorphism' | 'y2k' | 'cyberpunk';
export type ThemeMode = 'light' | 'dark' | 'system';
export type LiturgicalColorName = 'green' | 'red' | 'white' | 'violet' | 'rose' | 'black';

interface ThemeContextType {
  theme: ThemeName;
  themeMode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setThemeMode: (mode: ThemeMode) => void;
  liturgicalColor: LiturgicalColorName | null;
  setLiturgicalColor: (color: LiturgicalColorName | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('minimal');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [liturgicalColor, setLiturgicalColor] = useState<LiturgicalColorName | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'theme-minimal',
      'theme-kinetic',
      'theme-brutalist',
      'theme-retro',
      'theme-neumorphism',
      'theme-glassmorphism',
      'theme-y2k',
      'theme-cyberpunk',
      'dark'
    );
    root.classList.add(`theme-${theme}`);

    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    }
  }, [theme, themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    const colorHex = liturgicalColor ? getLiturgicalColorHex(liturgicalColor) : '#1152d4';
    root.style.setProperty('--liturgical-color', colorHex);
  }, [liturgicalColor]);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    themeMode,
    setThemeMode,
    liturgicalColor,
    setLiturgicalColor,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

function getLiturgicalColorHex(color: LiturgicalColorName): string {
  const colors: Record<LiturgicalColorName, string> = {
    green: '#2d6a4f',
    red: '#9b2226',
    white: '#ffffff',
    violet: '#8b5cf6',
    rose: '#fb7185',
    black: '#1f2937',
  };
  return colors[color];
}
