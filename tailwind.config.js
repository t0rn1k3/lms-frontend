/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        lms: {
          primary: "#0E2148",
          "primary-dark": "#0a1835",
          mint: "#CFFFE2",
          sage: "#A2D5C6",
          cream: "#A2D5C6",
          light: "#F6F6F6",
          bg: "#f1f5f9",
        },
      },
    },
  },
  plugins: [],
};
