import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
    { files: ["**/*.ts"] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
];

export default config;