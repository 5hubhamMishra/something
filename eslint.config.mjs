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
  ]),
  {
    // The WebGL/R3F layer intentionally uses imperative patterns (mutating
    // typed arrays inside useFrame animation loops, Math.random() for
    // one-time procedural geometry in useMemo) that are standard, documented
    // React Three Fiber practice for performance — useFrame runs outside
    // React's render cycle, so React's purity/immutability assumptions for
    // render-phase code don't apply there.
    files: ["src/components/canvas/**/*.tsx", "src/components/chapters/**/*.tsx"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
