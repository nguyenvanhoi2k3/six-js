// UMD-only entry - see core.ts's comment for why this is separate from the ESM entries. Now that
// SvgMotion collapsed to a single dispatch function (see svg-motion.ts's own doc comment - the
// previous DrawSVG/MorphSVG/MotionPath trio read as copies of GSAP's own paid plugin product
// names), it has one obvious "default" export, same as OnScroll/SmoothScroll/etc - Rollup's UMD
// wrapper assigns it directly to the global (`window.SvgMotion = SvgMotion`), used as
// `SvgMotion(target, { mode: "draw", ... })`.
export { SvgMotion as default } from "../../plugins/svg-motion/svg-motion";
