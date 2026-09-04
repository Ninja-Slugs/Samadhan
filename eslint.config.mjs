import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/next-env.d.ts",
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**"
    ]
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier
];

export default eslintConfig;
