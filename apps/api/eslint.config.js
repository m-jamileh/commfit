import baseConfig from "@commfit/config/eslint.config.js";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
