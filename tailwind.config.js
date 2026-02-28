/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- THIS PREVENTS DEVICE OS FROM HIJACKING COLORS
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
