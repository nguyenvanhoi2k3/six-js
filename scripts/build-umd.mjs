// six-js/scripts/build-umd.mjs
//
// UMD can't be code-split (no cross-file `import`s in the classic global-variable <script> model),
// so unlike the ESM build (one `vite build` invocation, multiple entries, Rollup shares common
// code across them into hashed chunks - see vite.config.ts), every UMD target here has to be its
// own fully self-contained Vite build, each producing one standalone file with its own copy of
// whatever core code it needs. Run as a loop over Vite's JS API rather than N near-identical
// `vite.umd.*.config.ts` files, which would just be this same list typed out N times.
//
// Real, accepted trade-off worth knowing before debugging something that looks like a sync bug:
// if a page loads more than one of these UMD files (e.g. `six-js.umd.js` AND `OnScroll.umd.js`),
// each bundled copy of `core/ticker.ts`'s shared singleton is a SEPARATE `Ticker` instance with
// its own independent rAF loop - not the literal same object the ESM build's tree-shaken imports
// would all resolve to. Both still tick at the same ~60fps rate, so nothing breaks outright, but
// they're not frame-synchronized with each other the way two ESM imports of `@six-js/core`'s
// ticker always are.
import { build } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, rmSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const targets = [
  { name: "six", entry: "src/entries/umd/core.ts", fileName: "six-js.umd.js" },
  { name: "OnScroll", entry: "src/entries/umd/on-scroll.ts", fileName: "OnScroll.umd.js" },
  { name: "SmoothScroll", entry: "src/entries/umd/smooth-scroll.ts", fileName: "SmoothScroll.umd.js" },
  { name: "SplitText", entry: "src/entries/umd/split-text.ts", fileName: "SplitText.umd.js" },
  { name: "ScrambleText", entry: "src/entries/umd/scramble-text.ts", fileName: "ScrambleText.umd.js" },
  { name: "Burst", entry: "src/entries/umd/burst.ts", fileName: "Burst.umd.js" },
  { name: "SvgMotion", entry: "src/entries/umd/svg-motion.ts", fileName: "SvgMotion.umd.js" },
  { name: "Components", entry: "src/entries/umd/components.ts", fileName: "Components.umd.js" },
];

for (const target of targets) {
  await build({
    root,
    configFile: false,
    logLevel: "warn",
    build: {
      minify: "esbuild",
      cssCodeSplit: false,
      emptyOutDir: false,
      lib: {
        entry: resolve(root, target.entry),
        name: target.name,
        formats: ["umd"],
        fileName: () => target.fileName,
      },
    },
  });
}

// Only the Components UMD build touches any CSS import (dialog.css/slider.css/marquee.css, via
// src/components/*/index.ts) - Vite still extracts that into a `style.css` alongside
// Components.umd.js even though `main` `vite build` already produced the real, canonical
// `dist/components.css` from the exact same source files (see vite.config.ts's own
// closeBundle-based rename). Deleted rather than published under a second name - a CDN consumer
// using Components.umd.js links the same documented `dist/components.css`, not a duplicate.
const strayCss = resolve(root, "dist/style.css");
if (existsSync(strayCss)) rmSync(strayCss);
