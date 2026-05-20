import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F4C81",
          50: "#E8F1F9",
          100: "#C6D9F0",
          200: "#8BB3E1",
          300: "#5090D2",
          400: "#1A6BC2",
          500: "#0F4C81",
          600: "#0C3E6B",
          700: "#093055",
          800: "#06223F",
          900: "#031429",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default preset;
