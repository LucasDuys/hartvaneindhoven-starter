import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f2ff",
          100: "#ebe5ff",
          200: "#d6ccff",
          300: "#b3a5ff",
          400: "#8f7eff",
          500: "#6b57ff", // primary
          600: "#5645cc",
          700: "#403399",
          800: "#2b2266",
          900: "#161133"
        },
        accent: {
          500: "#ff7a18"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.12)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
export default config;
