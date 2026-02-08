/**
 * Retro Theme - CRT Terminal Aesthetic
 * Inspired by 1980s computer terminals and retro computing
 */

import { Theme, ThemeColors, ThemeRadius, ThemeShadows, ThemeEffects } from './index';
import { baseTypography, baseSpacing } from './base';

// Retro Light (amber phosphor on black)
const retroLightColors: ThemeColors = {
  primary: '#FFB000',
  secondary: '#FF8800',
  tertiary: '#CC8800',
  
  background: '#1A1A1A',
  surface: '#2A2A2A',
  surfaceVariant: '#333333',
  
  onBackground: '#FFB000',
  onSurface: '#FFB000',
  onSurfaceVariant: '#CC9900',
  
  success: '#00FF00',
  warning: '#FFAA00',
  error: '#FF4444',
  info: '#00AAFF',
  
  disabled: '#555555',
  pressed: '#3A3A3A',
  hover: '#353535',
  
  border: '#FFB000',
  divider: '#443311',
  
  shadow: '#000000',
  overlay: 'rgba(255, 176, 0, 0.1)',
};

// Retro Dark (green phosphor on black)
const retroDarkColors: ThemeColors = {
  primary: '#33FF00',
  secondary: '#00CC44',
  tertiary: '#00AA33',
  
  background: '#0A0A0A',
  surface: '#141414',
  surfaceVariant: '#1E1E1E',
  
  onBackground: '#33FF00',
  onSurface: '#33FF00',
  onSurfaceVariant: '#22CC00',
  
  success: '#44FF44',
  warning: '#FFCC00',
  error: '#FF3333',
  info: '#33CCFF',
  
  disabled: '#333333',
  pressed: '#1A1A1A',
  hover: '#151515',
  
  border: '#33FF00',
  divider: '#113311',
  
  shadow: '#00FF00',
  overlay: 'rgba(51, 255, 0, 0.1)',
};

const retroRadius: ThemeRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  full: 0,
};

const retroShadows: ThemeShadows = {
  none: 'none',
  sm: '0 0 4px currentColor',
  md: '0 0 8px currentColor',
  lg: '0 0 16px currentColor',
  xl: '0 0 32px currentColor',
  inner: 'inset 0 0 8px currentColor',
};

const retroEffects: ThemeEffects = {
  glassBackground: 'none',
  glassBlur: 'none',
  glassBorder: '1px solid currentColor',
  
  neuInset: 'inset 0 0 10px rgba(0,0,0,0.5)',
  neuOutset: '0 0 10px currentColor',
  neuPressed: 'inset 0 0 20px rgba(0,0,0,0.8)',
  
  transitionFast: '0.1s ease',
  transitionMedium: '0.2s ease',
  transitionSlow: '0.3s ease',
  
  gradient: 'none',
  noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
  texture: 'none',
};

const retroTypography = {
  ...baseTypography,
  primaryFont: '"VT323", "Courier New", monospace',
  secondaryFont: '"Press Start 2P", monospace',
  monoFont: '"VT323", "Courier New", monospace',
};

export const retroLight: Theme = {
  name: 'Retro Light (Amber)',
  colors: retroLightColors,
  typography: retroTypography,
  spacing: baseSpacing,
  radius: retroRadius,
  shadows: retroShadows,
  effects: retroEffects,
};

export const retroDark: Theme = {
  name: 'Retro Dark (Green Phosphor)',
  colors: retroDarkColors,
  typography: retroTypography,
  spacing: baseSpacing,
  radius: retroRadius,
  shadows: retroShadows,
  effects: retroEffects,
};
