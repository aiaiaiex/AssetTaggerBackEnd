import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  //
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  //
  {
    ignores: ["eslint.config.mjs"],
  },
);
