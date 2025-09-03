/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      colors: {
        'brand-violet': '#8b5cf6',
        'brand-violet-dark': '#7c3aed',
        'generique': '#8b5cf6'
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}