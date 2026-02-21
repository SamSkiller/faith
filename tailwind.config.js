/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These allow you to use class names like 'text-rosePrimary'
        rosePrimary: '#f472b6',
        neonCyan: '#22d3ee',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        future: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
