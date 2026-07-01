/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1677ff',
          hover: '#4096ff',
          bg: '#e6f4ff',
          border: '#91caff',
        },
        text: {
          primary: 'rgba(0,0,0,0.88)',
          secondary: 'rgba(0,0,0,0.65)',
          tertiary: 'rgba(0,0,0,0.45)',
          disabled: 'rgba(0,0,0,0.25)',
        },
        border: {
          DEFAULT: '#f0f0f0',
          input: '#d9d9d9',
        },
        danger: {
          DEFAULT: '#ff4d4f',
          hover: '#ff7875',
          bg: '#fff1f0',
        },
        success: '#52c41a',
      },
    },
  },
  plugins: [],
}