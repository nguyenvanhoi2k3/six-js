// six-js/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    minify: "esbuild",
    cssCodeSplit: false,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "split-text": resolve(__dirname, "src/plugins/split-text/index.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName === "index" ? "six-js" : entryName}.${format}.js`,
    },
    rollupOptions: {
      output: {
        chunkFileNames: "shared/[name].js",
      },
    },
  },
  plugins: [
    dts({
      cleanVueFileName: true,
      copyDtsFiles: true, // 👈 copy nguyên văn các file .d.ts thuần, không qua rollup-dts xử lý
      beforeWriteFile: (filePath, content) => {
        return {
          filePath,
          content: content.replace(/import\s+['"].*\.css['"];?\s*/g, ""),
        };
      },
      afterBuild: () => {
        // Tự chèn reference vào dist/index.d.ts vì vite-plugin-dts
        // không tự trace side-effect import của file .d.ts thuần
        const indexDtsPath = resolve(__dirname, "dist/index.d.ts");
        const current = readFileSync(indexDtsPath, "utf-8");

        if (!current.includes("jsx.d.ts")) {
          writeFileSync(
            indexDtsPath,
            `/// <reference path="./jsx.d.ts" />\n${current}`,
          );
        }
      },
    }),
  ],
});