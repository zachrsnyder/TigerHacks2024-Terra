/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: {
          DEFAULT: 'var(--primary-color)',
          hover: 'var(--primary-hover)'
        },
        secondary: 'var(--secondary-color)',
        accent: { //green and a lighter green (secondary, secondary-light)
          DEFAULT: '#4D4B30',
          light: '#908660'
        },
        territiary: '#301e0a',
        text: 'var(--text-color)'
      }
    },
  },
  plugins: [],
}

