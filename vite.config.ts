// six-js/vite.config.ts
import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import { existsSync, renameSync } from "fs";
import dts from "vite-plugin-dts";

// Vite's library-mode CSS output ignores `rollupOptions.output.assetFileNames` for the combined
// CSS asset, and renaming it from a `generateBundle` hook (an earlier attempt) didn't stick either
// - confirmed against two real builds, both still produced `dist/style.css`. Something in Vite's
// own CSS pipeline runs after `generateBundle` and re-asserts the name. `closeBundle` fires only
// once Vite has fully finished writing every file to disk (for both a one-shot `vite build` and
// each incremental rebuild under `vite build --watch`) - a plain filesystem rename at that point
// can't be undone by anything Vite does afterward, since there's nothing left for it to do.
// `dist/components.css` is the name `package.json`'s `"./components.css"` export and every demo
// page's `<link rel="stylesheet" href="./dist/components.css">` expect.
function renameCssOutput(): Plugin {
  const from = resolve(__dirname, "dist/style.css");
  const to = resolve(__dirname, "dist/components.css");
  return {
    name: "six-js-rename-css-output",
    apply: "build",
    closeBundle() {
      if (existsSync(from)) renameSync(from, to);
    },
  };
}

export default defineConfig({
  build: {
    minify: "esbuild",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        OnScroll: resolve(__dirname, "src/entries/on-scroll.ts"),
        SmoothScroll: resolve(__dirname, "src/entries/smooth-scroll.ts"),
        SplitText: resolve(__dirname, "src/entries/split-text.ts"),
        ScrambleText: resolve(__dirname, "src/entries/scramble-text.ts"),
        Burst: resolve(__dirname, "src/entries/burst.ts"),
        SvgMotion: resolve(__dirname, "src/entries/svg-motion.ts"),
        Components: resolve(__dirname, "src/components/index.ts"),
      },
      formats: ["es"],
    },
  },
  plugins: [dts({ cleanVueFileName: true }), renameCssOutput()],
});
