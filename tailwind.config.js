/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#145CFF',
          hover: '#0D42D2',
          bg: '#E5F1FF',
          border: '#C2DCFF',
        },
        text: {
          primary: '#1D2126',
          secondary: '#545B66',
          tertiary: '#848B99',
          disabled: 'rgba(0,0,0,0.25)',
        },
        border: {
          DEFAULT: '#E2E6F0',
          input: '#D3D9E5',
        },
        danger: {
          DEFAULT: '#EC221F',
          hover: '#ff7875',
          bg: '#fff1f0',
        },
        success: '#14AE5C',
      },
    },
  },
  plugins: [],
}