// UMD-only entry - see core.ts's comment for why this is separate from the ESM entries. Three
// related exports, no single obvious "default" - Rollup's UMD wrapper falls back to assigning a
// plain object of named exports to the global instead (`window.SvgMotion = { DrawSVG, ... }`),
// used as `SvgMotion.DrawSVG(...)` etc.
export { drawSVG as DrawSVG, morphSVG as MorphSVG, motionPath as MotionPath } from "../../plugins/svg-motion/svg-motion";
