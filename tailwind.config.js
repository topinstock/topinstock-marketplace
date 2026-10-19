/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors — custom marine turquoise/teal palette
        blue: {
          50:  '#edfcff',
          100: '#d4f9fe',
          400: '#29DCFA',
          500: '#00AEC7',
          600: '#00afd0',
          700: '#008fa8',
          800: '#006b80',
          900: '#004f61',
        },
        // Accent / CTA — custom red palette (#C03653 & #F5436A)
        orange: {
          100: '#fde8ed',
          300: '#f88fab',
          400: '#F5436A',
          500: '#C03653',
          600: '#A02B44',
        },
        // Status colors
        green: {
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        red: {
          100: '#fee2e2',
          500: '#ef4444',
        },
        yellow: {
          500: '#eab308',
        },
        // Neutrals
        gray: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        full: '9999px',
      },
      boxShadow: {
        card:             '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover':     '0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
        marketplace:       '0 2px 10px -1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'marketplace-hover':'0 16px 32px -6px rgba(0,0,0,0.12), 0 6px 14px -2px rgba(0,0,0,0.06)',
        'glow-red':       '0 0 22px -2px rgba(245,67,106,0.35)',
        'glow-teal':      '0 0 22px -2px rgba(0,174,199,0.35)',
      },
      maxWidth: {
        container: '1320px',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heartPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease forwards',
        'scale-in':   'scaleIn 0.2s ease forwards',
        'slide-down': 'slideDown 0.25s ease forwards',
        'heart-pop':  'heartPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'shimmer':    'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};
