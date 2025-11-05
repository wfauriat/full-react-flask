/** @type {import('tailwindcss').Config} */
// Use CommonJS syntax, which is the default for Create React App projects.
module.exports = {
  // CRITICAL: The content array tells Tailwind to scan files for classes.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./src/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Set the recommended Inter font as the default sans-serif font
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}