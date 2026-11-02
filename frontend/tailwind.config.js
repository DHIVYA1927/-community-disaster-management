/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#030712'
        },
        emergency: {
          red: '#dc2626',
          orange: '#ea580c',
          green: '#16a34a',
          blue: '#1d4ed8'
        }
      }
    },
  },
  plugins: [],
}
