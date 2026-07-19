// six-js/vite.config.ts
import { defineConfig, Plugin } from "vite";
import { resolve, relative, dirname } from "path";
import { existsSync, renameSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import dts from "vite-plugin-dts";

const srcRoot = resolve(__dirname, "src");
const distRoot = resolve(__dirname, "dist");

// Shared with `build.lib.entry` below - the flat `dist/<Name>.js` names here are exactly what
// `package.json`'s `exports` map promises for every subpath's `import`/`require` condition.
const libEntries: Record<string, string> = {
  index: resolve(srcRoot, "index.ts"),
  OnScroll: resolve(srcRoot, "entries/on-scroll.ts"),
  SmoothScroll: resolve(srcRoot, "entries/smooth-scroll.ts"),
  SplitText: resolve(srcRoot, "entries/split-text.ts"),
  ScrambleText: resolve(srcRoot, "entries/scramble-text.ts"),
  Burst: resolve(srcRoot, "entries/burst.ts"),
  SvgMotion: resolve(srcRoot, "entries/svg-motion.ts"),
  Components: resolve(srcRoot, "components/index.ts"),
};

// vite-plugin-dts mirrors each entry's path relative to the shared `src/` root (the lowest common
// ancestor of every lib entry) into `dist/` - e.g. `src/entries/on-scroll.ts` -> `dist/entries/on-scroll.d.ts`,
// `src/components/index.ts` -> `dist/components/index.d.ts`. `package.json`'s `exports` map instead
// promises a flat `dist/OnScroll.d.ts`/`dist/Components.d.ts` per subpath, matching the JS/UMD output
// names - the two never agreed, so every subpath except the main entry (which happens to already sit
// at `src/index.ts`, i.e. zero nesting) had no `.d.ts` at the location `exports` actually points to,
// a `tsc`/editor-only failure (the built `.js` is unaffected - confirmed by reading `src/entries/*.ts`
// directly). Tried `rollupTypes: true` (+ the `@microsoft/api-extractor` peer dep it requires) first -
// the documented, "correct" way to collapse each entry to one self-contained `.d.ts` - but it didn't
// produce files at the promised flat paths either when `build.lib.entry` is a named multi-entry object
// (suspected vite-plugin-dts@5.0.x bug), and pulling in api-extractor is a heavier dependency than this
// problem needs. Each entry's generated `.d.ts` is a thin 1-3 line re-export shim (not a real bundled
// declaration file), so flattening it post-hoc - move it to the flat path, rewrite its relative
// `from "..."` specifiers to still resolve from the new location - is simple and doesn't depend on
// vite-plugin-dts internals at all. Same `closeBundle` hook shape as `renameCssOutput` below, for the
// same reason: fires once every file is already written to disk, so nothing after it can undo the move.
function flattenTypesOutput(): Plugin {
  return {
    name: "six-js-flatten-dts-output",
    apply: "build",
    closeBundle() {
      for (const [name, entryPath] of Object.entries(libEntries)) {
        if (name === "index") continue; // already flat: src/index.ts -> dist/index.d.ts
        const relFromSrc = relative(srcRoot, entryPath).replace(/\.tsx?$/, ".d.ts");
        const mirrored = resolve(distRoot, relFromSrc);
        if (!existsSync(mirrored)) continue;
        const mirroredDir = dirname(mirrored);
        const content = readFileSync(mirrored, "utf8");
        const rewritten = content.replace(/from\s+["']([^"']+)["']/g, (match, spec: string) => {
          if (!spec.startsWith(".")) return match;
          const absTarget = resolve(mirroredDir, spec);
          let newSpec = relative(distRoot, absTarget).replace(/\\/g, "/");
          if (!newSpec.startsWith(".")) newSpec = `./${newSpec}`;
          return match.replace(spec, newSpec);
        });
        writeFileSync(resolve(distRoot, `${name}.d.ts`), rewritten);
        unlinkSync(mirrored);
      }
    },
  };
}

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
      entry: libEntries,
      formats: ["es"],
    },
  },
  plugins: [dts({ cleanVueFileName: true }), renameCssOutput(), flattenTypesOutput()],
});
