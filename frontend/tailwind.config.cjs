/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"]
      },
      colors: {
        night: {
          900: "#0b0f14",
          800: "#0f1520",
          700: "#131b2a"
        },
        fog: {
          50: "#f6f7fb",
          100: "#edf0f7",
          200: "#dfe5f0"
        },
        brand: {
          500: "#2f6fed",
          600: "#225bd1"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.12)",
        glow: "0 0 0 1px rgba(47, 111, 237, 0.25), 0 20px 40px rgba(47, 111, 237, 0.2)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};