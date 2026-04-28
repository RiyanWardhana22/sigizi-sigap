/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sigizi-green": "#285A48",
        "sigizi-light-green": "#3a7d65",
        "sigizi-bg": "#f7f7f7",
      },
    },
  },
  plugins: [],
};
