/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--tw-primary) / <alpha-value>)',
          light: 'rgb(var(--tw-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--tw-primary-dark) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--tw-accent) / <alpha-value>)',
          light: 'rgb(var(--tw-accent-light) / <alpha-value>)',
          dark: 'rgb(var(--tw-accent-dark) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        '500': '500ms',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
};
