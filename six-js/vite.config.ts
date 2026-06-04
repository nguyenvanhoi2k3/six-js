import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"), // hoặc src/main.ts tùy dự án của bạn
      name: "SixJS",
      formats: ["es", "umd"],
      fileName: (format) => `six-js.${format}.js`,
    },
    rollupOptions: {
      output: {
        // Ép Vite/Rollup luôn đặt tên file CSS xuất ra là style.css thay vì đặt theo tên thư viện
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "style.css";
          }
          return "[name].[ext]";
        },
      },
    },
  },
});
