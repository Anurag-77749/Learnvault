/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          950: '#0f0e26',
          900: '#1e1b4b',
          800: '#312e81',
          700: '#4338ca',
          600: '#4f46e5',
        },
        slate: {
          950: '#020617',
          900: '#0f172a',
          850: '#141e33',
          800: '#1e293b',
        },
        accent: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
