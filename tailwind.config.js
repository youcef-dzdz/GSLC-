/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      colors: {
        // The core branding colors
        brand: {
          navy: '#0f172a',    // The deep dark color of the 'GSLC' text
          blue: '#3b82f6',    // The 1st dash under the logo
          orange: '#f59e0b',  // The 2nd dash
          green: '#10b981',   // The 3rd dash
          red: '#f43f5e',     // The 4th dash
        },
        // The soft pastel colors for the cards and backgrounds
        pastel: {
          blueBg: '#eff6ff',
          blueText: '#3b82f6',
          greenBg: '#f0fdf4',
          greenText: '#10b981',
          purpleBg: '#faf5ff',
          purpleText: '#a855f7',
          orangeBg: '#fffbeb',
          orangeText: '#f59e0b',
        }
      },
      fontFamily: {
        // The design uses a very clean geometric font. 
        // We will set up a modern sans-serif stack.
        sans: ['Inter', 'system-ui', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}