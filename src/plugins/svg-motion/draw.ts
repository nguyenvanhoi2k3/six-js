import { Animation, AnimationVars } from "../../core/animation";
import { EaseFn, resolveEase } from "../../easing/easing";
import { getDefaults } from "../../core/defaults";
import { rootTimeline } from "../../core/root";
import { Timeline } from "../../timeline/timeline";
import { resolveTargets, TweenTarget } from "../../tween/tween";
import { computeStaggerDelay, StaggerInput } from "../../timeline/stagger";
import { isGeometryElement } from "./svg-geometry";

export interface DrawVars extends AnimationVars {
  duration?: number;
  ease?: string | EaseFn;
  /**
   * Starting visible window, as a ratio ("0%"/0..1) or an explicit `[start, end]` pair for a
   * partially-drawn starting state. Default "0%" (`[0, 0]` - nothing drawn).
   */
  from?: string | number | [string | number, string | number];
  /**
   * Ending visible window. A single value means `[0, value]` - the ordinary "draw the whole
   * thing in" case (default "100%", i.e. `[0, 1]`). A two-token string ("20% 80%") or an explicit
   * `[start, end]` pair animates both ends independently, for a moving "comet" segment instead of
   * a fixed-start reveal. Values aren't clamped to 0-100% - combined with `repeat: -1` and a
   * `from`/`to` exactly one full lap apart (e.g. `from: "0% 15%"` to `to: "100% 115%"`), the
   * window overshoots past 100% and wraps seamlessly (dash offset/array are modular over the
   * path's own length), producing an endless "chasing" loop with no reset jump at each repeat.
   */
  to?: string | number | [string | number, string | number];
  /** Extra delay per element (seconds) when `target` resolves to more than one shape - see `computeStaggerDelay`. */
  stagger?: StaggerInput;
}

type Window = [number, number];

function parseRatio(v: string | number): number {
  if (typeof v === "number") return v;
  const t = v.trim();
  return t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t);
}

function parseWindow(value: DrawVars["from"], fallback: Window): Window {
  if (value === undefined) return fallback;
  if (Array.isArray(value)) return [parseRatio(value[0]), parseRatio(value[1])];
  if (typeof value === "string") {
    const parts = value.trim().split(/\s+/);
    if (parts.length === 2) return [parseRatio(parts[0]), parseRatio(parts[1])];
  }
  return [0, parseRatio(value)];
}

/**
 * Reveals (or hides) an SVG shape's stroke by animating `stroke-dasharray`/`stroke-dashoffset` -
 * the classic "line draw" effect (GSAP's DrawSVGPlugin). A plain Animation subclass rather than a
 * Tween property (see svg-motion.ts's own doc comment for why every svgMotion effect is built
 * this way): `_renderIteration` gets an already-eased-free localTime/duration from the shared
 * Animation base for free (play/pause/reverse/repeat/timeline nesting all come along with it),
 * and applies its own ease here since dasharray/dashoffset aren't part of the PropertyTrack system.
 */
export class DrawAnimation extends Animation {
  private el: Element;
  private ease: EaseFn;
  private fromWindow: Window;
  private toWindow: Window;
  private length = 0;

  constructor(target: Element, vars: DrawVars = {}) {
    super(vars);
    const defaults = getDefaults();
    this.el = target;
    this.ease = resolveEase(vars.ease ?? defaults.ease);
    this.fromWindow = parseWindow(vars.from, [0, 0]);
    this.toWindow = parseWindow(vars.to, [0, 1]);
    this.duration(vars.duration ?? defaults.duration);
    this.render(0, true, true);
  }

  protected _onInit(): void {
    this.length = (this.el as unknown as SVGGeometryElement).getTotalLength();
  }

  protected _renderIteration(localTime: number): void {
    const dur = this.duration() as number;
    const progress = dur ? localTime / dur : 1;
    const eased = this.ease(progress);

    const start = this.fromWindow[0] + (this.toWindow[0] - this.fromWindow[0]) * eased;
    const end = this.fromWindow[1] + (this.toWindow[1] - this.fromWindow[1]) * eased;

    // Deliberately NOT clamped to [0, 1] - GSAP's own DrawSVGPlugin doesn't either (verified
    // against its source: `_parseSingleVal`/`_parse` only sort min/max, never bound to the
    // path's own length). This is what makes the classic "endless spinner" loop possible: a
    // constant-width window animated e.g. `from: "0% 15%"` to `to: "100% 115%"` with `repeat: -1`
    // sweeps the SAME 15%-wide segment exactly one full lap, landing byte-for-byte back where it
    // started - `stroke-dashoffset`/`stroke-dasharray` are inherently modular over the path's
    // total length per the SVG spec, so an offset past 100% (or negative) renders identically to
    // its in-range equivalent, giving a seamless loop with no reset jump. Clamping here would
    // instead force the window back into [0, 100%] every repeat, producing a visible snap-back at
    // each cycle boundary - exactly the "jerky" loop this replaced.
    const lo = Math.min(start, end) * this.length;
    const hi = Math.max(start, end) * this.length;
    const visible = Math.max(0, hi - lo);

    const style = (this.el as HTMLElement).style;
    style.strokeDasharray = `${visible} ${Math.max(this.length - visible, 0.0001)}`;
    style.strokeDashoffset = `${-lo}`;
  }
}

/**
 * `SvgMotion(target, { mode: "draw", ... })` - `target` resolves like any other six-js target
 * (selector, Element, list); resolving to more than one shape (e.g. every letter path in an
 * outlined SVG word) builds one DrawAnimation per shape and groups them in a Timeline, same
 * "reuse Timeline, don't invent a group type" principle `six.to()`'s own stagger support uses -
 * so a whole multi-letter draw-in can still be paused/reversed/killed as one unit.
 */
export function drawSVG(target: TweenTarget, vars: DrawVars = {}): DrawAnimation | Timeline {
  const { stagger, ...rest } = vars;
  const elements = resolveTargets(target).filter((el) => {
    if (isGeometryElement(el)) return true;
    console.warn('[six-js] SvgMotion({ mode: "draw" }): skipping non-geometry element', el);
    return false;
  });

  if (elements.length === 0) {
    console.warn('[six-js] SvgMotion({ mode: "draw" }) requires a resolvable target');
    const empty = new Timeline();
    rootTimeline.add(empty);
    return empty;
  }

  if (elements.length === 1 && stagger === undefined) {
    const anim = new DrawAnimation(elements[0], rest);
    rootTimeline.add(anim);
    return anim;
  }

  const baseDelay = rest.delay ?? 0;
  const group = new Timeline();
  elements.forEach((el, index) => {
    const delay = baseDelay + (stagger !== undefined ? computeStaggerDelay(index, elements.length, stagger) : 0);
    group.add(new DrawAnimation(el, { ...rest, delay }), 0);
  });
  rootTimeline.add(group);
  return group;
}
