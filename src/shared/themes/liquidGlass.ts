/**
 * Liquid Glass Theme - Glassmorphism Aesthetic
 * Modern frosted glass effect with depth and blur
 */

import { Theme, ThemeColors, ThemeRadius, ThemeShadows, ThemeEffects } from './index';
import { baseTypography, baseSpacing } from './base';

// Liquid Glass Light
const liquidGlassLightColors: ThemeColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  tertiary: '#AF52DE',
  
  background: 'rgba(245, 245, 247, 0.8)',
  surface: 'rgba(255, 255, 255, 0.72)',
  surfaceVariant: 'rgba(255, 255, 255, 0.48)',
  
  onBackground: '#1C1C1E',
  onSurface: '#1C1C1E',
  onSurfaceVariant: '#3A3A3C',
  
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  disabled: 'rgba(142, 142, 147, 0.4)',
  pressed: 'rgba(120, 120, 128, 0.16)',
  hover: 'rgba(120, 120, 128, 0.08)',
  
  border: 'rgba(120, 120, 128, 0.2)',
  divider: 'rgba(120, 120, 128, 0.16)',
  
  shadow: 'rgba(0, 0, 0, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

// Liquid Glass Dark
const liquidGlassDarkColors: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  tertiary: '#BF5AF2',
  
  background: 'rgba(28, 28, 30, 0.8)',
  surface: 'rgba(44, 44, 46, 0.72)',
  surfaceVariant: 'rgba(58, 58, 60, 0.48)',
  
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#EBEBF5',
  
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#64D2FF',
  
  disabled: 'rgba(142, 142, 147, 0.4)',
  pressed: 'rgba(120, 120, 128, 0.24)',
  hover: 'rgba(120, 120, 128, 0.12)',
  
  border: 'rgba(120, 120, 128, 0.24)',
  divider: 'rgba(120, 120, 128, 0.2)',
  
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

const liquidGlassRadius: ThemeRadius = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

const liquidGlassShadows: ThemeShadows = {
  none: 'none',
  sm: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
  lg: '0 16px 48px rgba(0, 0, 0, 0.16), 0 4px 8px rgba(0, 0, 0, 0.12)',
  xl: '0 24px 64px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.16)',
  inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.08)',
};

const liquidGlassEffects: ThemeEffects = {
  glassBackground: 'rgba(255, 255, 255, 0.25)',
  glassBlur: 'blur(20px) saturate(180%)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.3)',
  
  neuInset: 'none',
  neuOutset: 'none',
  neuPressed: 'none',
  
  transitionFast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionMedium: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  
  gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  noise: 'none',
  texture: 'none',
};

const liquidGlassTypography = {
  ...baseTypography,
  primaryFont: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  secondaryFont: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
  monoFont: '"SF Mono", "Monaco", "Inconsolata", monospace',
};

export const liquidGlassLight: Theme = {
  name: 'Liquid Glass Light',
  colors: liquidGlassLightColors,
  typography: liquidGlassTypography,
  spacing: baseSpacing,
  radius: liquidGlassRadius,
  shadows: liquidGlassShadows,
  effects: liquidGlassEffects,
};

export const liquidGlassDark: Theme = {
  name: 'Liquid Glass Dark',
  colors: liquidGlassDarkColors,
  typography: liquidGlassTypography,
  spacing: baseSpacing,
  radius: liquidGlassRadius,
  shadows: liquidGlassShadows,
  effects: liquidGlassEffects,
};
