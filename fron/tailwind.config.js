/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
          gray: {
            100: '#F2F2F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#636366',
            800: '#48484A',
            900: '#3A3A3C',
          },
        },
      },
      animation: {
        'ios-bounce': 'ios-bounce 0.5s ease-in-out',
        'ios-fade': 'ios-fade 0.3s ease-in-out',
        'ios-slide-up': 'ios-slide-up 0.3s ease-out',
        'ios-slide-down': 'ios-slide-down 0.3s ease-out',
        'ios-scale': 'ios-scale 0.2s ease-out',
      },
      keyframes: {
        'ios-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        'ios-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ios-slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-scale': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'ios-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '16px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
} 