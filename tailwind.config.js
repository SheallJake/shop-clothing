/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme colors
        "light-bg": "#FFFFFF",
        "light-text": "#000000",
        "light-gray-1": "#F5F5F5",
        "light-gray-2": "#E0E0E0",
        "light-gray-3": "#BDBDBD",

        // Dark theme colors
        "dark-bg": "#000000",
        "dark-text": "#FFFFFF",
        "dark-gray-1": "#2C2C2C",
        "dark-gray-2": "#3A3A3A",
        "dark-gray-3": "#4F4F4F",
      },
      borderWidth: {
        thin: "0.5px",
        DEFAULT: "0.5px",
      },
      fontFamily: {
        sans: ["Inter", "Open Sans", "Roboto", "sans-serif"],
      },
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
