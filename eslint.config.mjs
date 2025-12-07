import simpleImportSort from "eslint-plugin-simple-import-sort";
import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Sorting imports and exports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Disable new rule that's too strict for localStorage initialization pattern
      // TODO: Refactor to use useSyncExternalStore or initializer functions
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**"],
  },
];
