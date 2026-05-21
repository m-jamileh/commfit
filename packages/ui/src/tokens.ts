export const colors = {
  bg: "#F7F5F0",
  primary: {
    DEFAULT: "#16314D",
    foreground: "#FFFFFF",
  },
  accent: {
    DEFAULT: "#C3551A",
    foreground: "#FFFFFF",
  },
  success: {
    DEFAULT: "#2C6A45",
    foreground: "#FFFFFF",
  },
  warning: {
    DEFAULT: "#A77918",
    foreground: "#FFFFFF",
  },
  danger: {
    DEFAULT: "#A93022",
    foreground: "#FFFFFF",
  },
  info: {
    DEFAULT: "#2A5780",
    foreground: "#FFFFFF",
  },
  surface: "#FFFFFF",
  border: "#E2DDD6",
  text: {
    primary: "#1A1714",
    secondary: "#6B6560",
    muted: "#9E9990",
  },
} as const;

export const typography = {
  fontFamily: {
    display: "General Sans, system-ui, sans-serif",
    sans: "DM Sans, system-ui, sans-serif",
    mono: "Geist Mono, ui-monospace, monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export const borderRadius = {
  sm: "4px",
  DEFAULT: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(22, 49, 77, 0.06)",
  DEFAULT: "0 2px 8px rgba(22, 49, 77, 0.08)",
  md: "0 4px 16px rgba(22, 49, 77, 0.12)",
  lg: "0 8px 32px rgba(22, 49, 77, 0.16)",
} as const;
