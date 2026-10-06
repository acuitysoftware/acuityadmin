/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#062B6E",
        secondary: "#01A9FB",
        accent: "#FD6301",
        gold: "#FCAE01",
        surface: "#F4F8FC",
        body: "#0B1730",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        heading: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
