import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference/source packages kept in the repository are not part of the
    // Next.js application and use their own lint/build conventions.
    "ONLINE-CET-PORTEL-main/**",
    "ADMISSION-FORM-PACKAGE/**",
  ]),
]);

export default eslintConfig;
