import type { Config } from "tailwindcss";
import preset from "@commfit/config/tailwind.preset";

const config: Config = {
  presets: [preset as Config],
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
};

export default config;
