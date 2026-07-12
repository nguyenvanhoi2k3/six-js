# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # gen-version + vite build -> dist/ (es + umd + type declarations)
npm run dev     # gen-version + vite build --watch
```

There is no test suite and no lint script configured. `npm run gen-version` regenerates `src/version.ts` from `package.json`'s `version` field — do not hand-edit `src/version.ts`.

`index.html` (project root) is a manual sandbox page for exercising the library in a browser via Vite; it imports the built output from `./dist/six-js.es.js`, so it only reflects source changes after a rebuild.

**Standing rule for this repo: only edit code, never run build/dev/server commands or any other shell commands unless the user explicitly asks. Never write code comments. Never read `dist/` or `node_modules/`.**

## Package shape

Published as `@six-js/core`. Entry point `src/index.ts` exports exactly two things: the `six` object and `VERSION`. Everything else (`Playable`, `SxTween`, `SxTimeline`, `SxMediaScope`, `Breakpoints`, etc.) is intentionally internal/unexported — keep it that way unless the user explicitly asks to widen the public surface. Vite (`vite.config.ts`) builds ES + UMD bundles plus rolled-up `.d.ts` via `vite-plugin-dts`; a CSS entry is exposed separately as `./style.css`.

## Architecture

### Animation core (`src/core/`)

Everything animatable implements the `Animatable` interface (`animatable.ts`): `duration`, `render(localTime, isJump?)`, optional `onStart`/`onComplete`.

- **`SxTween`** (`tween.ts`) — the leaf animation unit. Builds per-property interpolation tracks from `TweenVars` (numeric/color/complex/discrete, keyframes, transform-aware) using the property registry (`src/properties/`).
- **`Playable`** (`playable.ts`) — wraps a single `Animatable` and drives it from the shared `ticker` RAF loop. Owns play/pause/reverse/seek/restart/repeat/boomerang/delay and an event emitter (`start`/`update`/`complete`/`repeat`/`reverseComplete`). `kill()` must call `pause()` *before* setting the internal `dead` flag — `pause()` itself is guarded by `dead`, so flipping the flag first silently skips `ticker.remove()` and leaks a permanently-running tick callback.
- **`SxTimeline`** (`timeline.ts`) — composes multiple `Animatable`s (`SxTimelineEngine`) behind one `Playable`. Position strings (`"<"`, `">"`, `"+=1"`, label refs) are resolved by `resolvePosition`. `render(t, isJump)`: when `isJump` is true it force-renders *every* child regardless of whether that child's local time is in range, which can cause a same-frame render-order clash if two children touch the same property (relevant when building `repeat`-driven timelines).
- **`PlayableGroup`** (`stagger.ts`) — a flat collection of `Playable`s sharing per-index stagger delays; used for `stagger` on `to/from/fromTo`.
- **`SxTicker`** (`ticker.ts`) — the single shared `requestAnimationFrame` loop (`ticker` singleton). Sleeps automatically when no listeners remain; supports `fps()` throttling and lag smoothing.
- **`ScrollTriggerController`** (`scroll-trigger.ts`) — drives a `Playable`/`PlayableGroup` (anything satisfying `ScrollDrivable`: `seek`, optional `play`, `duration`) from scroll position. Parses GSAP-style `start`/`end` position strings (`"top bottom"`, `"+=500"`, label-relative). `sync: true` seeks directly to scroll progress every frame; `sync: <number>` eases toward it via the ticker (treated as a lag-seconds constant). `sticky: true` pins the trigger element: it wraps it in a spacer `div` (which reserves the scroll distance) and keeps the element **always `position: fixed`**, continuously repositioning via `transform: translate3d(0, topPx, 0)` computed as one piecewise-linear function of scroll position (matches the natural pre/post-pin position exactly at the `start`/`end` boundaries). This replaced an earlier discrete before/during/after state-switch design that visibly snapped on fast scroll — do not reintroduce per-state CSS position switching for pinning.
- **`SxMediaScope`** (`media-scope.ts`) + **`scope-stack.ts`** — the `six.media()` implementation (a differently-shaped analogue of GSAP's `matchMedia`/context). `scope-stack.ts` holds a module-level "active scope" stack; `Playable`'s constructor calls `getActiveScope()?._capture(this)`, so *any* `to/from/fromTo/timeline/stagger` call made synchronously inside a `six.media()` handler (or inside a `scope.track(fn)`-wrapped function) is auto-registered for kill-on-teardown. `SxMediaScope` itself also self-captures into a parent scope when nested, so killing an outer scope cascades into inner ones. Media query change events are coalesced through one `requestAnimationFrame` and diffed against the previous match snapshot before re-running the handler, to avoid redundant teardown/rebuild churn when multiple queries flip in the same frame.
- **`overwrite-manager.ts`** — opt-in (`overwrite: true`) same-target conflict killing, tracked in a `WeakMap<HTMLElement, Set<Playable>>`. Off by default; `overwrite: "auto"` currently degrades to full `true` behavior with a one-time warning (property-level overwrite isn't implemented).
- **`breakpoints.ts`** — width-based (container width, not `matchMedia`) responsive option merging used by web components via a `breakpoints="{...}"` HTML attribute; unrelated to `six.media()`, which is `window.matchMedia`-based and imperative/JS-driven.

### Property system (`src/properties/`)

A registry (`registry.ts`, `registerProperty(key, handler)`) maps a tween property name to a `numeric | color | complex | discrete` handler with `getCurrent`/`apply`. Built-ins are registered via side-effect imports in `src/properties/index.ts`: `transform.ts` (x/y/z/rotate*/scale*/skew*, all backed by a per-element `TransformCache` in `transform-state.ts` so multiple transform properties compose into one `transform:` string), `css-numeric.ts`, `color-props.ts`, `complex-props.ts` (multi-number CSS values like `box-shadow`), `discrete-props.ts`, and `media-props.ts` (`currentTime` on `<video>`/`<audio>`, enabling `six.to(video, { currentTime, onScroll: {...} })` scroll-scrubbing). Unregistered keys starting with `--` are treated as CSS custom properties; any other unregistered key falls back to a plain CSS style property. To support a new kind of animatable target value, register a new handler here rather than special-casing it in `tween.ts`.

### Public API surface (`src/six.ts`)

The `six` object is the entire public surface: `initElements` (lazily registers web components once), `getClass`/`getId` (querySelector helpers), `set` (instant, no `Playable`), `to`/`from`/`fromTo` (single tween or, with `stagger`, a `PlayableGroup`; `onScroll` wires a `ScrollTriggerController`), `timeline`, `media`, `setDefaults` (global duration/ease defaults, `src/core/defaults.ts`).

### Web components (`src/components/`)

Each component directory exports a `register<Name>()` that calls `customElements.define` guarded by `customElements.get(...)` (safe to call more than once); `src/components/index.ts#registerComponents()` calls all of them and is invoked by `six.initElements()`. Components: `sx-animate`, `sx-marquee` (+`sx-marquee-inner`/`sx-marquee-item`), `sx-slider` (+ track/slide/progress/prev/next/pagination), `sx-dialog` (+ trigger/pull/close-cursor). Components consume the core engine (`Playable`, `SxTween`, `Breakpoints`) internally rather than going through the public `six` object.
