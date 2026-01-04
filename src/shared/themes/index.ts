/**
 * Universal Theming System
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 * 
 * A comprehensive theming library supporting multiple design aesthetics
 * with light/dark variants. Can be applied to any React Native/Web project.
 */

export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  tertiary: string;
  
  // Background hierarchy
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text hierarchy
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive states
  disabled: string;
  pressed: string;
  hover: string;
  
  // Borders and dividers
  border: string;
  divider: string;
  
  // Shadows and overlays
  shadow: string;
  overlay: string;
}

export interface ThemeTypography {
  // Font families
  primaryFont: string;
  secondaryFont: string;
  monoFont: string;
  
  // Font sizes
  displayLarge: number;
  displayMedium: number;
  displaySmall: number;
  headlineLarge: number;
  headlineMedium: number;
  headlineSmall: number;
  titleLarge: number;
  titleMedium: number;
  titleSmall: number;
  bodyLarge: number;
  bodyMedium: number;
  bodySmall: number;
  labelLarge: number;
  labelMedium: number;
  labelSmall: number;
  
  // Font weights
  thin: string;
  light: string;
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
  extraBold: string;
  
  // Line heights
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
}

export interface ThemeEffects {
  // Glassmorphism
  glassBackground: string;
  glassBlur: string;
  glassBorder: string;
  
  // Neumorphism/Skeuomorphic
  neuInset: string;
  neuOutset: string;
  neuPressed: string;
  
  // Animations
  transitionFast: string;
  transitionMedium: string;
  transitionSlow: string;
  
  // Special effects
  gradient: string;
  noise: string;
  texture: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  effects: ThemeEffects;
}

export type ThemeVariant = 'brutalist' | 'skeuomorphic' | 'liquidGlass' | 'retro';
export type ThemeMode = 'light' | 'dark';
export type ThemeKey = `${ThemeVariant}_${ThemeMode}`;

// Base typography (consistent across themes)
const baseTypography: ThemeTypography = {
  primaryFont: 'system-ui, -apple-system, sans-serif',
  secondaryFont: 'Georgia, serif',
  monoFont: 'ui-monospace, monospace',
  
  displayLarge: 57,
  displayMedium: 45,
  displaySmall: 36,
  headlineLarge: 32,
  headlineMedium: 28,
  headlineSmall: 24,
  titleLarge: 22,
  titleMedium: 16,
  titleSmall: 14,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
  labelLarge: 14,
  labelMedium: 12,
  labelSmall: 11,
  
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.8,
};

// Base spacing (consistent across themes)
const baseSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};