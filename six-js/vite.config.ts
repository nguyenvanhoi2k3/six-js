// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SixJS',
      fileName: (format) => `six-js.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: true // <-- Thay đổi ở đây, bật true để Vite v8 tự dùng bộ nén tối ưu (Oxc/Rolldown native)
  }
});