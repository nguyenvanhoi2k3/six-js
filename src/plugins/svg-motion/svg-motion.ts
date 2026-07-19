/**
 * Three SVG effects (draw-on/reveal a stroke, morph one shape's `d` into another, move a target
 * along a guide path - "biến đổi từ svg này sang svg khác" / "chạy đường line svg từ 0 đến full" /
 * "máy bay bay theo đường lượn sóng svg"), all built the same way: each is its own `Animation`
 * subclass (`core/animation.ts`), not a Tween property. That's a deliberate architectural choice,
 * not a shortcut - every OTHER plugin in this codebase (burst, onScroll, smoothScroll, splitText)
 * is built without touching Tween/Timeline's own internals (`property-track.ts`/`registry.ts`/
 * `tween.ts`), either driving the ticker directly (burst, for genuine continuous physics) or
 * composing around an existing Animation (onScroll). None of the three effects fit the
 * PropertyTrack model at all - their state isn't a single interpolated number/color/string
 * (stroke-dasharray needs the path's total length up front, morph needs pre-sampled point sets,
 * the path-follow effect needs a live path query every frame) - so subclassing `Animation`
 * directly (exactly what Tween and Timeline themselves do) gets
 * play/pause/resume/reverse/restart/repeat/boomerang/delay/kill/context-capture/events for free
 * without adding a fourth kind of PropertyTrack to core.
 *
 * `SvgMotion(target, vars)` is the ONE public entry point (single named export from
 * `@six-js/core/SvgMotion`) - `vars.mode` picks which of the three effects to run. This is
 * deliberate, not an accident of implementation: the three effects used to be exported
 * individually as `DrawSVG`/`MorphSVG`/`MotionPath`, names that read as direct copies of GSAP's
 * own paid Club GreenSock plugin product names (`DrawSVGPlugin`/`MorphSVGPlugin`/
 * `MotionPathPlugin`) rather than as six-js's own - a real brand-confusion/trademark concern once
 * flagged, not a hypothetical one. Collapsing to a single `SvgMotion` export (matching the
 * subpath's own name, which was never itself GSAP-derived) removes every public identifier that
 * could be mistaken for one of those product names, without needing to invent three new made-up
 * words for what are otherwise industry-standard, GSAP-independent animation concepts (draw-on,
 * morph, motion path). The three per-effect implementations underneath (`draw.ts`/`morph.ts`/
 * `motion-path.ts`) are unchanged and still independently unit-tested - this file is purely the
 * dispatch layer.
 */
import { Timeline } from "../../timeline/timeline";
import { TweenTarget } from "../../tween/tween";
import { drawSVG, DrawAnimation, DrawVars } from "./draw";
import { morphSVG, MorphAnimation, MorphVars } from "./morph";
import { motionPath, MotionPathAnimation, MotionPathVars } from "./motion-path";
import { SvgShapeInput } from "./svg-geometry";

export { DrawAnimation, MorphAnimation, MotionPathAnimation };
export type { SvgShapeInput };

export interface SvgMotionDrawVars extends DrawVars {
  mode: "draw";
}

export interface SvgMotionMorphVars extends MorphVars {
  mode: "morph";
  /** The shape to morph into - same accepted forms as `target` (element, selector, or a raw path `d` string). */
  toShape: SvgShapeInput;
}

export interface SvgMotionPathVars extends MotionPathVars {
  mode: "path";
}

export type SvgMotionVars = SvgMotionDrawVars | SvgMotionMorphVars | SvgMotionPathVars;

export function SvgMotion(target: SvgShapeInput, vars: SvgMotionMorphVars): MorphAnimation;
export function SvgMotion(target: TweenTarget, vars: SvgMotionDrawVars): DrawAnimation | Timeline;
export function SvgMotion(target: TweenTarget, vars: SvgMotionPathVars): MotionPathAnimation | Timeline;
export function SvgMotion(
  target: TweenTarget | SvgShapeInput,
  vars: SvgMotionVars,
): DrawAnimation | MorphAnimation | MotionPathAnimation | Timeline {
  switch (vars.mode) {
    case "draw": {
      const { mode, ...rest } = vars;
      return drawSVG(target as TweenTarget, rest);
    }
    case "morph": {
      const { mode, toShape, ...rest } = vars;
      return morphSVG(target as SvgShapeInput, toShape, rest);
    }
    case "path": {
      const { mode, ...rest } = vars;
      return motionPath(target as TweenTarget, rest);
    }
    default: {
      const unreachable: never = vars;
      throw new Error(`[six-js] SvgMotion(): unknown mode "${(unreachable as SvgMotionVars).mode}"`);
    }
  }
}
