/**
 * Brutalist Theme - Raw, bold, uncompromising design
 * Inspired by brutalist architecture and early web aesthetics
 */

import { Theme, ThemeColors, ThemeRadius, ThemeShadows, ThemeEffects } from './index';
import { baseTypography, baseSpacing } from './base';

// Brutalist Light
const brutalistLightColors: ThemeColors = {
  primary: '#000000',
  secondary: '#FF0000',
  tertiary: '#0000FF',
  
  background: '#FFFFFF',
  surface: '#F0F0F0',
  surfaceVariant: '#E0E0E0',
  
  onBackground: '#000000',
  onSurface: '#000000',
  onSurfaceVariant: '#333333',
  
  success: '#00FF00',
  warning: '#FFFF00',
  error: '#FF0000',
  info: '#00FFFF',
  
  disabled: '#808080',
  pressed: '#CCCCCC',
  hover: '#F5F5F5',
  
  border: '#000000',
  divider: '#000000',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

// Brutalist Dark
const brutalistDarkColors: ThemeColors = {
  primary: '#FFFFFF',
  secondary: '#FF4444',
  tertiary: '#4444FF',
  
  background: '#000000',
  surface: '#1A1A1A',
  surfaceVariant: '#2A2A2A',
  
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#CCCCCC',
  
  success: '#44FF44',
  warning: '#FFFF44',
  error: '#FF4444',
  info: '#44FFFF',
  
  disabled: '#666666',
  pressed: '#333333',
  hover: '#1F1F1F',
  
  border: '#FFFFFF',
  divider: '#FFFFFF',
  
  shadow: '#FFFFFF',
  overlay: 'rgba(255, 255, 255, 0.8)',
};

const brutalistRadius: ThemeRadius = {
  none: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 0,
};

const brutalistShadows: ThemeShadows = {
  none: 'none',
  sm: '2px 2px 0px currentColor',
  md: '4px 4px 0px currentColor',
  lg: '8px 8px 0px currentColor',
  xl: '16px 16px 0px currentColor',
  inner: 'inset 2px 2px 0px currentColor',
};

const brutalistEffects: ThemeEffects = {
  glassBackground: 'none',
  glassBlur: 'none',
  glassBorder: '2px solid currentColor',
  
  neuInset: 'none',
  neuOutset: 'none',
  neuPressed: 'none',
  
  transitionFast: 'none',
  transitionMedium: 'none',
  transitionSlow: 'none',
  
  gradient: 'none',
  noise: 'none',
  texture: 'none',
};

const brutalistTypography = {
  ...baseTypography,
  primaryFont: 'ui-monospace, "Courier New", monospace',
  secondaryFont: 'ui-monospace, "Courier New", monospace',
};

export const brutalistLight: Theme = {
  name: 'Brutalist Light',
  colors: brutalistLightColors,
  typography: brutalistTypography,
  spacing: baseSpacing,
  radius: brutalistRadius,
  shadows: brutalistShadows,
  effects: brutalistEffects,
};

export const brutalistDark: Theme = {
  name: 'Brutalist Dark',
  colors: brutalistDarkColors,
  typography: brutalistTypography,
  spacing: baseSpacing,
  radius: brutalistRadius,
  shadows: brutalistShadows,
  effects: brutalistEffects,
};