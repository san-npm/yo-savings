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
        // Light Theme Design System Colors
        background: '#F8FAFC', // slate-50, very light gray
        card: '#FFFFFF', // pure white
        border: '#E2E8F0', // slate-200, subtle borders
        'border-hover': '#CBD5E1', // slate-300, hover borders
        primary: '#22C55E', // green-500, primary actions
        'primary-hover': '#16A34A', // green-600, hover state
        secondary: '#6366F1', // indigo-500, secondary actions
        success: '#22C55E', // green-500, for money/earnings
        error: '#EF4444', // red-500
        'text-primary': '#1E293B', // slate-800, main text
        'text-secondary': '#64748B', // slate-500, secondary text
        'text-muted': '#94A3B8', // slate-400, muted text
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
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
      },
      fontFeatureSettings: {
        'numeric': ['tnum', 'lnum'],
      },
    },
  },
  plugins: [
    // Add tabular numbers utility
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