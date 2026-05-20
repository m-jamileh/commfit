import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: "#F7F5F0",
        primary: { DEFAULT: "#16314D", foreground: "#FFFFFF" },
        accent: { DEFAULT: "#C3551A", foreground: "#FFFFFF" },
        success: { DEFAULT: "#2C6A45", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#A77918", foreground: "#FFFFFF" },
        danger: { DEFAULT: "#A93022", foreground: "#FFFFFF" },
        info: { DEFAULT: "#2A5780", foreground: "#FFFFFF" },
        surface: "#FFFFFF",
        border: "#E2DDD6",
        "text-primary": "#1A1714",
        "text-secondary": "#6B6560",
        "text-muted": "#9E9990",
      },
      fontFamily: {
        display: ["General Sans", "system-ui", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(22, 49, 77, 0.06)",
        DEFAULT: "0 2px 8px rgba(22, 49, 77, 0.08)",
        md: "0 4px 16px rgba(22, 49, 77, 0.12)",
        lg: "0 8px 32px rgba(22, 49, 77, 0.16)",
      },
    },
  },
  plugins: [],
};

export default preset;
