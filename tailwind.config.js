/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        semibold: 600,
        bold: 700,
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
