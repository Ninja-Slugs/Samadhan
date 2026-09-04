import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url))
});

const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/next-env.d.ts",
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "packages/database/generated/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier
];

export default eslintConfig;
