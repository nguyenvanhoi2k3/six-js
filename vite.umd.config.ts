// six-js/vite.umd.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    minify: "esbuild",
    cssCodeSplit: false,
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SixJS",
      formats: ["umd"],
      fileName: () => "six-js.umd.js",
    },
  },
});
