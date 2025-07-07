/**
 * Theme Provider - React Context for Universal Theming System
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Theme, ThemeKey, ThemeMode, ThemeVariant } from './index';
import { brutalistLight, brutalistDark } from './brutalist';
import { skeuomorphicLight, skeuomorphicDark } from './skeuomorphic';

interface ThemeContextType {
  theme: Theme;
  currentVariant: ThemeVariant;
  currentMode: ThemeMode;
  setTheme: (variant: ThemeVariant, mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialVariant?: ThemeVariant;
  initialMode?: ThemeMode;
}

const themes: Record<ThemeKey, Theme> = {
  brutalist_light: brutalistLight,
  brutalist_dark: brutalistDark,
  skeuomorphic_light: skeuomorphicLight,
  skeuomorphic_dark: skeuomorphicDark,
  liquidGlass_light: brutalistLight, // Placeholder until implemented
  liquidGlass_dark: brutalistDark,   // Placeholder until implemented
  retro_light: skeuomorphicLight,    // Placeholder until implemented
  retro_dark: skeuomorphicDark,      // Placeholder until implemented
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialVariant = 'brutalist',
  initialMode = 'light'
}) => {
  const [currentVariant, setCurrentVariant] = useState<ThemeVariant>(initialVariant);
  const [currentMode, setCurrentMode] = useState<ThemeMode>(initialMode);

  const getCurrentTheme = (): Theme => {
    const themeKey: ThemeKey = `${currentVariant}_${currentMode}`;
    return themes[themeKey] || themes.brutalist_light;
  };

  const setTheme = (variant: ThemeVariant, mode: ThemeMode) => {
    setCurrentVariant(variant);
    setCurrentMode(mode);
  };

  const toggleMode = () => {
    setCurrentMode(currentMode === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme: getCurrentTheme(),
    currentVariant,
    currentMode,
    setTheme,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};