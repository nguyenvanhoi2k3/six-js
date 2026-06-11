import { defineConfig } from "vite";
import { resolve } from "path";
import minifyHTML from "rollup-plugin-minify-html-literals";
import type { PreRenderedAsset } from "rollup";

export default defineConfig({
  build: {
    minify: "esbuild",
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SixJS",
      formats: ["es", "umd"],
      fileName: (format) => `six-js.${format}.js`,
    },
    rollupOptions: {
      plugins: [((minifyHTML as any).default || minifyHTML)()],
      output: {
        assetFileNames: (assetInfo: PreRenderedAsset) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "six-js.css";
          }
          return "[name].[ext]";
        },
      },
    },
  },
});