const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      textColor: {
        white: '#FFF',
        black: '#000'
      },
      colors: {
        dark: '#0d1117',
        'dark-light': '#161b22',
        'light-line': 'rgba(0, 0, 0, 0.1)',
        'dark-line': 'rgba(255, 255, 255, 0.1)',
        midnight: colors.midlight
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
