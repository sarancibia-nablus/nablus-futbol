/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nablus: {
          primary: '#A493DC',
          'primary-dark': '#8C77CE',
          'primary-light': '#D2C9EE',
          'primary-lighter': '#E8E4F6',
          'primary-lightest': '#F9F7FD',
          dark: '#191919',
          light: '#FAFAFA',
          white: '#FFFFFF',
          success: '#10B981',
          'success-soft': '#96C8C7',
          info: '#3B82F6',
          'info-soft': '#A1C8F1',
          danger: '#EF4444',
          'danger-soft': '#FA6E77',
          warning: '#F59E0B',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'nablus-sm': '12px',
        'nablus-md': '16px',
        'nablus-lg': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
