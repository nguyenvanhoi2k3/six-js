// six-js/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "six-js.es.js",
    },
  },
  plugins: [dts({ cleanVueFileName: true })],
});
