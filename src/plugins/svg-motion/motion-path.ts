import { Animation, AnimationVars } from "../../core/animation";
import { EaseFn, resolveEase } from "../../easing/easing";
import { getDefaults } from "../../core/defaults";
import { rootTimeline } from "../../core/root";
import { Timeline } from "../../timeline/timeline";
import { resolveTargets, TweenTarget } from "../../tween/tween";
import { computeStaggerDelay, StaggerInput } from "../../timeline/stagger";
import { getTransformCache, renderTransform } from "../../animate/transform-cache";
import { resolveGeometry, SvgShapeInput } from "./svg-geometry";

export interface SvgMotionPathVars extends AnimationVars {
  duration?: number;
  ease?: string | EaseFn;
  /** The guide curve - an SVGGeometryElement, a CSS selector resolving to one, or a raw path `d` string (materialized into a detached, never-rendered `<path>` - the guide doesn't need to be visible). */
  path: SvgShapeInput;
  /**
   * Rotate the target to face the path's direction of travel. `true` uses the raw tangent angle;
   * a number adds a fixed degree offset on top of it, to correct for whichever way the target's
   * own artwork points by default (e.g. a plane icon drawn facing up needs `autoRotate: 90` to
   * actually point along a path that starts out heading right). Default `false` (no rotation).
   */
  autoRotate?: boolean | number;
  /** Starting progress along the path, 0-1. Default 0 (the path's own start). */
  from?: number;
  /** Ending progress along the path, 0-1. Default 1 (the path's own end). */
  to?: number;
  /** Extra delay per element (seconds) when `target` resolves to more than one element - see `computeStaggerDelay`. */
  stagger?: StaggerInput;
}

interface Vec {
  x: number;
  y: number;
}

/**
 * Moves a target element along an SVG path (GSAP's MotionPathPlugin) by writing straight into the
 * SAME shared per-element transform cache every ordinary six-js tween writes into
 * (`animate/transform-cache.ts`) - not a competing `element.style.transform =` write of its own -
 * so a motionPath animation composes cleanly with any other transform tween running on the same
 * element (e.g. a simultaneous scale pulse) instead of one clobbering the other. Applied as a
 * DELTA from the path's own start point (matching GSAP's real behavior): the target keeps
 * whatever base x/y it already had from CSS/other tweens, and moves by the same amount the path
 * point itself moves relative to progress 0 - it does not jump to the path's absolute SVG
 * coordinates, which are usually a completely different coordinate space than the target's own
 * page position (the guide path is very often not even the same size/position as its mover).
 */
export class MotionPathAnimation extends Animation {
  private target: Element;
  private pathEl: Element;
  private ease: EaseFn;
  private autoRotate: boolean | number;
  private fromRatio: number;
  private toRatio: number;
  private length = 0;
  private startPoint: Vec = { x: 0, y: 0 };
  private baseX = 0;
  private baseY = 0;

  constructor(target: Element, vars: SvgMotionPathVars) {
    super(vars);
    const defaults = getDefaults();
    this.target = target;
    this.pathEl = resolveGeometry(vars.path);
    this.ease = resolveEase(vars.ease ?? defaults.ease);
    this.autoRotate = vars.autoRotate ?? false;
    this.fromRatio = vars.from ?? 0;
    this.toRatio = vars.to ?? 1;
    this.duration(vars.duration ?? defaults.duration);
    this.render(0, true, true);
  }

  protected _onInit(): void {
    const geometry = this.pathEl as unknown as SVGGeometryElement;
    this.length = geometry.getTotalLength();
    const cache = getTransformCache(this.target);
    this.baseX = cache.x;
    this.baseY = cache.y;
    this.startPoint = geometry.getPointAtLength(this.fromRatio * this.length);
  }

  private pointAt(ratio: number): Vec {
    const len = Math.max(0, Math.min(1, ratio)) * this.length;
    return (this.pathEl as unknown as SVGGeometryElement).getPointAtLength(len);
  }

  protected _renderIteration(localTime: number): void {
    const dur = this.duration() as number;
    const progress = dur ? localTime / dur : 1;
    const eased = this.ease(progress);
    const ratio = this.fromRatio + (this.toRatio - this.fromRatio) * eased;
    const point = this.pointAt(ratio);

    const cache = getTransformCache(this.target);
    cache.x = this.baseX + (point.x - this.startPoint.x);
    cache.y = this.baseY + (point.y - this.startPoint.y);

    if (this.autoRotate !== false) {
      // Tangent via a small symmetric step around the current point rather than a forward-only
      // difference, so the very first/last frame (where a forward-only step would fall off the
      // end of the path) still gets a meaningful direction.
      const eps = Math.max(this.length * 0.001, 0.05);
      const ahead = Math.min(1, ratio + eps / (this.length || 1));
      const behind = Math.max(0, ratio - eps / (this.length || 1));
      const p1 = this.pointAt(ahead);
      const p0 = this.pointAt(behind);
      const offset = typeof this.autoRotate === "number" ? this.autoRotate : 0;
      if (p1.x !== p0.x || p1.y !== p0.y) {
        cache.rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI) + offset;
      }
    }

    renderTransform(this.target, cache, progress > 0 && progress < 1);
  }
}

/**
 * `six.svgMotion.motionPath(target, vars)` - `target` resolves like any other six-js target;
 * resolving to more than one element (e.g. a flock of icons following the same route) builds one
 * MotionPathAnimation per element and groups them in a Timeline - see drawSVG's own doc comment
 * for why (same "reuse Timeline, don't invent a group type" principle).
 */
export function motionPath(target: TweenTarget, vars: SvgMotionPathVars): MotionPathAnimation | Timeline {
  const { stagger, ...rest } = vars;
  const elements = resolveTargets(target);

  if (elements.length === 0) {
    console.warn("[six-js] motionPath() requires a resolvable target");
    const empty = new Timeline();
    rootTimeline.add(empty);
    return empty;
  }

  if (elements.length === 1 && stagger === undefined) {
    const anim = new MotionPathAnimation(elements[0], rest);
    rootTimeline.add(anim);
    return anim;
  }

  const baseDelay = rest.delay ?? 0;
  const group = new Timeline();
  elements.forEach((el, index) => {
    const delay = baseDelay + (stagger !== undefined ? computeStaggerDelay(index, elements.length, stagger) : 0);
    group.add(new MotionPathAnimation(el, { ...rest, delay }), 0);
  });
  rootTimeline.add(group);
  return group;
}
