/**
 * Three SVG effects (GSAP's DrawSVGPlugin + MorphSVGPlugin + MotionPathPlugin, bundled as one
 * plugin per the actual ask - "biến đổi từ svg này sang svg khác" / "chạy đường line svg từ 0
 * đến full" / "máy bay bay theo đường lượn sóng svg"), all built the same way: each is its own
 * `Animation` subclass (`core/animation.ts`), not a Tween property. That's a deliberate
 * architectural choice, not a shortcut - every OTHER plugin in this codebase (burst, onScroll,
 * smoothScroll, splitText) is built without touching Tween/Timeline's own internals
 * (`property-track.ts`/`registry.ts`/`tween.ts`), either driving the ticker directly (burst, for
 * genuine continuous physics) or composing around an existing Animation (onScroll). None of
 * drawSVG/morphSVG/motionPath fit the PropertyTrack model at all - their state isn't a single
 * interpolated number/color/string (stroke-dasharray needs the path's total length up front,
 * morph needs pre-sampled point sets, motionPath needs a live path query every frame) - so
 * subclassing `Animation` directly (exactly what Tween and Timeline themselves do) gets
 * play/pause/resume/reverse/restart/repeat/boomerang/delay/kill/context-capture/events for free
 * without adding a fourth kind of PropertyTrack to core.
 */
export { drawSVG, DrawAnimation } from "./draw";
export type { SvgDrawVars } from "./draw";
export { morphSVG, MorphAnimation } from "./morph";
export type { SvgMorphVars } from "./morph";
export { motionPath, MotionPathAnimation } from "./motion-path";
export type { SvgMotionPathVars } from "./motion-path";
export type { SvgShapeInput } from "./svg-geometry";

import { drawSVG } from "./draw";
import { morphSVG } from "./morph";
import { motionPath } from "./motion-path";

export const svgMotion = {
  draw: drawSVG,
  morph: morphSVG,
  motionPath: motionPath,
};
