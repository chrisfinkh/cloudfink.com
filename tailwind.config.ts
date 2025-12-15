import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f6ff',
          100: '#b3e4ff',
          200: '#80d2ff',
          300: '#4dc0ff',
          400: '#35B6FF',
          500: '#1aa3f0',
          600: '#0d8ad4',
          700: '#0670b0',
          800: '#04568a',
          900: '#023c64',
          DEFAULT: '#35B6FF',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(53, 182, 255, 0.15)',
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 30px -10px rgba(53, 182, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
