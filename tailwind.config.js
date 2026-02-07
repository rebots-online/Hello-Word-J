module.exports = {
  darkMode: 'class',
  content: [
    './HelloWord/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (from Stitch)
        'primary': '#1152d4',
        'primary-glow': '#3b82f6',
        
        // Backgrounds
        'background-light': '#f6f6f8',
        'background-dark': '#101622',
        
        // Surfaces
        'surface-light': '#ffffff',
        'surface-dark': '#1a2233',
        
        // Liturgical Colors
        'liturgical-green': '#2d6a4f',
        'liturgical-gold': '#d4af37',
        'liturgical-red': '#9b2226',
        'liturgical-violet': '#8b5cf6',
        'liturgical-rose': '#fb7185',
        'liturgical-black': '#1f2937',
        
        // Text Colors
        'text-latin': '#ffffff',
        'text-english': '#9ca3af',
        
        // Semantic Colors
        'rubric': '#f87171',
        'gold': '#d4af37',
        'gold-light': '#fcd34d',
        'gold-dark': '#b45309',
      },
      fontFamily: {
        'display': ['Noto Serif', 'serif'],
        'sans': ['Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(212, 175, 55, 0.2)',
        'neon-gold': '0 0 15px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 3s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        }
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
};
