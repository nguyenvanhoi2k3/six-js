// src/index.ts
export * from "./components/animate/animate";
export * from "./components/marquee/marquee";
export * from "./components/slider";
export * from "./components/dialog";

import { VERSION } from "./version";
console.log(`@six-js/core v${VERSION}`);

export { VERSION };