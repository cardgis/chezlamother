/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: "#F23D4F", 600: "#E23345", 700: "#CC2B3B" },
        saffron:   { DEFAULT: "#FFB23F" },
        ink:       { DEFAULT: "#1E2430" },
        cream:     { DEFAULT: "#FFF7EC" },
        card:      { DEFAULT: "#FFFFFF" },
        green:     { 600: "#22C55E" },
        red:       { 500: "#EF4444" },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(30,36,48,.06)",
        lift: "0 10px 30px rgba(242,61,79,.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        display: ['Poppins','ui-sans-serif','system-ui'],
        body: ['Inter','ui-sans-serif','system-ui'],
      },
    },
  },
  plugins: [],
};
