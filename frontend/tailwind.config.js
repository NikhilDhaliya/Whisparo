/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Threads color palette
        'threads': {
          'black': '#000000',
          'white': '#FFFFFF',
          'gray': {
            50: '#F9F9F9',
            100: '#F4F4F4',
            200: '#E4E4E4',
            300: '#D3D3D3',
            400: '#A2A2A2',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
          'blue': {
            500: '#0095F6',
            600: '#0081D6',
          },
          'red': {
            500: '#ED4956',
          },
          'green': {
            500: '#00C851',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
      },
      maxWidth: {
        'threads': '630px',
      },
    },
  },
  plugins: [],
} 