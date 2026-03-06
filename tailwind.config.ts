import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        // Yo Brand Design System — Light Theme
        background: '#FFFFFF',
        'background-secondary': '#F1F3F5',
        surface: '#F8F9FA',
        'surface-elevated': '#E9ECEF',
        card: '#F8F9FA',
        border: '#E9ECEF',
        'border-hover': '#DEE2E6',

        // Brand accent — emerald green
        accent: '#10B981',

        // Vault-specific colors
        vault: {
          usd: '#10B981',
          eur: '#3B82F6',
          btc: '#FFAF4F',
          gold: '#FFBF00',
          sol: '#DA6AFF',
        },

        // Semantic colors
        primary: '#10B981',
        'primary-hover': '#059669',
        secondary: '#10B981',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',

        // Text
        'text-primary': '#1A1A2E',
        'text-secondary': '#6C757D',
        'text-muted': '#ADB5BD',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'balance': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        'rate': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-gentle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(0%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-5%)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      addUtilities({
        '.tabular-nums': {
          'font-variant-numeric': 'tabular-nums',
        },
        '.safe-area-pb': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      });
    },
  ],
};

export default config;
