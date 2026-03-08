/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'scheme': '#93c5fd', // bg-blue-300
        'domain': '#bbf7d0', // bg-green-200
        'port': '#e9d5ff',   // bg-purple-200
        'path': '#fed7aa',   // bg-orange-200
        'fragment': '#bfdbfe', // bg-blue-200
      }
    },
  },
  plugins: [],
}
