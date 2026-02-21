/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#E91E8C',
          'pink-dark': '#C4177A',
          'pink-light': '#FF4DA6',
          purple: '#7B2D8E',
          yellow: '#FFD700',
        }
      }
    },
  },
  plugins: [],
}
