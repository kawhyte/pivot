/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-quicksand)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-quicksand)', 'ui-sans-serif', 'system-ui'], // Use Quicksand for display too
        accent: ['var(--font-quicksand)', 'ui-sans-serif', 'system-ui'], // Consistent font family
      },
      colors: {
        // Duolingo Primary Colors
        'duolingo-green': {
          DEFAULT: '#58CC02',
          dark: '#46A302',
          light: '#88D843',
        },
        'success-bright': '#58CC02',
        'success-bg': '#D7FFB8',
        'warning-orange': '#FF9600',
        'error-red': '#FF4B4B',

        // Neutral Palette
        'neutral': {
          50: '#FFFFFF',
          100: '#F7F7F7',
          200: '#E5E5E5',
          300: '#AFAFAF',
          700: '#4B4B4B',
          900: '#1C1C1C',
        },

        // Progress Bar Colors
        'glow-orange': '#FF9600',
        'glow-yellow': '#FFC800',

        // Path Accent Colors (for badges/icons only)
        'path-pop-purple': '#CE82FF',
        'path-renaissance-blue': '#1CB0F6',
        'path-heart-pink': '#FF4B4B',

        // Semantic Tokens (mapped to CSS variables)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',      // 16px
        md: '12px',
        sm: '8px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        full: '9999px',
      },
      keyframes: {
        // Success Overlay - Quick Pop (600ms)
        successPop: {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(0.8)'
          },
          '50%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1.05)'
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(1)'
          },
        },
        // Fade In for Page Transitions (300ms)
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Slide Up for Content (300ms)
        slideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(12px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
      animation: {
        'success-pop': 'successPop 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        // NO infinite animations
      },
    },
  },
  plugins: [],
};
