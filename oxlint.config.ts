import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import svelte from "ultracite/oxlint/svelte";

export default defineConfig({
  extends: [core, svelte],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      files: ["*.svelte"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
  ],
});
