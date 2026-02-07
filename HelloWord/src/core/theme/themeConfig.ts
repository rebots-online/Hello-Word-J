export interface Theme {
  id: ThemeName;
  name: string;
  description: string;
  config: {
    borderStyle: 'subtle' | 'solid' | 'neon' | 'none' | 'scanlines' | 'gradient' | 'sharp';
    shadowStyle: 'medium' | 'heavy' | 'none' | 'glow' | 'text-shadow' | 'soft' | 'blur';
    backgroundStyle: 'clean' | 'gradient' | 'pattern' | 'glass' | 'flat' | 'frosted' | 'crt';
    borderRadius: 'xl' | 'lg' | 'none' | 'sm' | 'sharp';
  };
}

export const THEMES: Record<ThemeName, Theme> = {
  minimal: {
    name: 'Minimal',
    description: 'Clean Swiss design',
    config: {
      borderStyle: 'subtle',
      shadowStyle: 'medium',
      backgroundStyle: 'clean',
      borderRadius: 'xl',
    },
  },
  kinetic: {
    name: 'Kinetic',
    description: 'Colorful, dynamic, Gumroad-inspired',
    config: {
      borderStyle: 'none',
      shadowStyle: 'glow',
      backgroundStyle: 'gradient',
      borderRadius: '2xl',
    },
  },
  brutalist: {
    name: 'Brutalist',
    description: 'Raw, honest, monospace aesthetic',
    config: {
      borderStyle: 'solid',
      shadowStyle: 'none',
      backgroundStyle: 'flat',
      borderRadius: 'none',
    },
  },
  retro: {
    name: 'Retro',
    description: 'CRT terminal vibes with scanlines',
    config: {
      borderStyle: 'scanlines',
      shadowStyle: 'text-shadow',
      backgroundStyle: 'crt',
      borderRadius: 'sm',
    },
  },
  neumorphism: {
    name: 'Neumorphism',
    description: 'Soft shadows, extruded surfaces',
    config: {
      borderStyle: 'none',
      shadowStyle: 'soft',
      backgroundStyle: 'off-white',
      borderRadius: 'lg',
    },
  },
  glassmorphism: {
    name: 'Glassmorphism',
    description: 'Frosted glass with depth',
    config: {
      borderStyle: 'thin-white',
      shadowStyle: 'blur',
      backgroundStyle: 'frosted',
      borderRadius: 'xl',
    },
  },
  y2k: {
    name: 'Y2K',
    description: 'Early 2000s web maximalism',
    config: {
      borderStyle: 'gradient',
      shadowStyle: 'drop-shadow',
      backgroundStyle: 'pattern-filled',
      borderRadius: 'rounded',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Neon-soaked dystopian future',
    config: {
      borderStyle: 'neon',
      shadowStyle: 'glow-heavy',
      backgroundStyle: 'dark-grid',
      borderRadius: 'sharp',
    },
  },
};

export function getThemeIcon(theme: ThemeName): string {
  const icons: Record<ThemeName, string> = {
    minimal: 'circle',
    kinetic: 'motion_photos_on',
    brutalist: 'grid_on',
    retro: 'monitor',
    neumorphism: 'blur_on',
    glassmorphism: 'auto_awesome',
    y2k: 'star',
    cyberpunk: 'bolt',
  };
  return icons[theme];
}
