/**
 * Skeuomorphic Theme - Rich textures, depth, and realistic materials
 * Inspired by early iOS and tactile design principles
 */

import { Theme, ThemeColors, ThemeRadius, ThemeShadows, ThemeEffects } from './index';
import { baseTypography, baseSpacing } from './base';

// Skeuomorphic Light
const skeuomorphicLightColors: ThemeColors = {
  primary: '#007AFF',
  secondary: '#FF9500',
  tertiary: '#34C759',
  
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F8F8',
  
  onBackground: '#1C1C1E',
  onSurface: '#1C1C1E',
  onSurfaceVariant: '#3A3A3C',
  
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  disabled: '#C7C7CC',
  pressed: '#E5E5EA',
  hover: '#F0F0F5',
  
  border: '#C6C6C8',
  divider: '#E5E5EA',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

// Skeuomorphic Dark
const skeuomorphicDarkColors: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#FF9F0A',
  tertiary: '#30D158',
  
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#EBEBF5',
  
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  
  disabled: '#48484A',
  pressed: '#3A3A3C',
  hover: '#2C2C2E',
  
  border: '#38383A',
  divider: '#48484A',
  
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

const skeuomorphicRadius: ThemeRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

const skeuomorphicShadows: ThemeShadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
};

const skeuomorphicEffects: ThemeEffects = {
  glassBackground: 'rgba(255, 255, 255, 0.25)',
  glassBlur: 'blur(10px)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.18)',
  
  neuInset: 'inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
  neuOutset: '5px 5px 10px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.9)',
  neuPressed: 'inset 3px 3px 7px rgba(0, 0, 0, 0.25), inset -3px -3px 7px rgba(255, 255, 255, 0.9)',
  
  transitionFast: 'all 0.15s ease-in-out',
  transitionMedium: 'all 0.3s ease-in-out',
  transitionSlow: 'all 0.5s ease-in-out',
  
  gradient: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
  noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
  texture: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
};

const skeuomorphicTypography = {
  ...baseTypography,
  primaryFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  secondaryFont: 'Georgia, "Times New Roman", serif',
};

export const skeuomorphicLight: Theme = {
  name: 'Skeuomorphic Light',
  colors: skeuomorphicLightColors,
  typography: skeuomorphicTypography,
  spacing: baseSpacing,
  radius: skeuomorphicRadius,
  shadows: skeuomorphicShadows,
  effects: skeuomorphicEffects,
};

export const skeuomorphicDark: Theme = {
  name: 'Skeuomorphic Dark',
  colors: skeuomorphicDarkColors,
  typography: skeuomorphicTypography,
  spacing: baseSpacing,
  radius: skeuomorphicRadius,
  shadows: skeuomorphicShadows,
  effects: skeuomorphicEffects,
};