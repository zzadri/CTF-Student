/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
      },
      dropShadow: {
        'glow-green': '0 0 3px rgba(74, 222, 128, 0.5)',
        'glow-red': '0 0 3px rgba(248, 113, 113, 0.5)',
      },
      animation: {
        'notification-in': 'notification-in 0.3s ease-out',
      },
      keyframes: {
        'notification-in': {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class',
} 