# @six-js/core

A lightweight animation library — Core, Tween, Timeline, and ScrollTrigger. Phase 1 of a ground-up rewrite; see `CLAUDE.md` for architecture notes and current scope.

---

## 📦 Installation

```bash
npm install @six-js/core
```

```bash
yarn add @six-js/core
```

```bash
pnpm add @six-js/core
```

The package ships ESM (`import`) and UMD (`require`) builds plus type declarations — no extra setup needed for either bundlers or a plain `<script>` tag.

## 🚀 Usage

```js
import { six } from "@six-js/core";

six.to(".box", { x: 100, duration: 1, ease: "power2.out" });

six.timeline()
  .to(".box", { x: 100, duration: 1 })
  .to(".box2", { opacity: 1, duration: 0.5 }, "<");

six.to(".box", {
  x: 300,
  scrollTrigger: { start: "top bottom", end: "bottom top", scrub: true },
});
```

## Status

Only Core, Tween, Timeline, and ScrollTrigger are implemented so far. Plugins (SplitText, Draggable, Flip, ScrollSmoother, MotionPath) are not part of this phase.
