/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        fadeIn: "fadeIn 0.3s ease-out",
        slideDown: "slideDown 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        slideUp: "slideUp 0.5s ease-out",
        slideIn: "slideIn 0.5s ease-out",
        shine: "shine 5s linear infinite",
      },
    },
  },
  plugins: [],
};
