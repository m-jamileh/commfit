export const colors = {
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

export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
} as const;
