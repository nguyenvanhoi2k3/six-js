import { Animation, AnimationVars } from "../../core/animation";
import { EaseFn, resolveEase } from "../../easing/easing";
import { getDefaults } from "../../core/defaults";
import { rootTimeline } from "../../core/root";
import { resolveGeometry, shapeToPath, SvgShapeInput } from "./svg-geometry";

export interface SvgMorphVars extends AnimationVars {
  duration?: number;
  ease?: string | EaseFn;
  /** Sample points used to approximate both shapes for interpolation - higher is smoother/more faithful at some extra one-time cost (paid once, in `_onInit`, never per-frame). Default 120. */
  precision?: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Exported standalone (like `parseEdge`/`resolvePositionString` in scroll-trigger.ts) so the
 * point-sampling/alignment/reconstruction math is unit-testable against mocked geometry, without
 * needing a real morph animation running. */
export function samplePoints(el: Element, count: number, closed: boolean): Point[] {
  const geometry = el as unknown as SVGGeometryElement;
  const length = geometry.getTotalLength();
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = closed ? i / count : count === 1 ? 0 : i / (count - 1);
    const p = geometry.getPointAtLength(t * length);
    points.push({ x: p.x, y: p.y });
  }
  return points;
}

export function isClosed(d: string): boolean {
  return /[zZ]\s*$/.test(d.trim());
}

function asPathElement(d: string): Element {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  return p;
}

function rotate(points: Point[], shift: number): Point[] {
  const n = points.length;
  return Array.from({ length: n }, (_, i) => points[(i + shift) % n]);
}

/**
 * Picks whichever rotation/winding-direction of `to` best lines up with `from`, index-for-index
 * (minimizing total squared point-to-point distance) - both shapes are sampled independently
 * starting from their own path's start, which for two unrelated shapes usually land at very
 * different physical spots and windings, so interpolating them index-for-index unmodified tends
 * to visibly "twist" the morph (a real, easy-to-see artifact, not a hypothetical one). Only
 * applies to CLOSED shapes - a rotation is meaningless for an open path (there is no "wrap
 * around" to try), so an open `to` is only tried forward vs reversed, never shifted.
 */
export function alignToFrom(from: readonly Point[], to: Point[], closed: boolean): Point[] {
  const n = from.length;
  const candidates = [to, [...to].reverse()];
  let best = to as Point[];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const shifts = closed ? n : 1;
    for (let shift = 0; shift < shifts; shift++) {
      const shifted = shift === 0 ? candidate : rotate(candidate, shift);
      let score = 0;
      for (let i = 0; i < n; i++) {
        const dx = shifted[i].x - from[i].x;
        const dy = shifted[i].y - from[i].y;
        score += dx * dx + dy * dy;
      }
      if (score < bestScore) {
        bestScore = score;
        best = shifted;
      }
    }
  }

  return best;
}

export function lerpPoints(a: readonly Point[], b: readonly Point[], t: number): Point[] {
  return a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * t, y: p.y + (b[i].y - p.y) * t }));
}

/**
 * Uniform Catmull-Rom -> cubic-bezier conversion (tension 1/6, the standard formula) through the
 * sampled points, rather than a plain polyline (`L` commands) - a polyline would look visibly
 * faceted for anything but a very high sample count, and a smooth curve is what "morph" reads as
 * for typical blob/logo/letterform shapes.
 */
export function pointsToBezierPath(points: readonly Point[], closed: boolean): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M${points[0].x},${points[0].y}`;

  const at = (i: number): Point => (closed ? points[((i % n) + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);

  let d = `M${points[0].x},${points[0].y}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  if (closed) d += " Z";
  return d;
}

/**
 * Morphs `target`'s own `d` attribute from its current shape into `toShape`'s (GSAP's
 * MorphSVGPlugin) by sampling both shapes into equal-length point sets and interpolating each
 * pair positionally - NOT GSAP's own shape-fitting/point-reduction algorithm (a much larger, more
 * involved piece of work), a documented scope cut. Good enough for typical
 * blob/icon/letterform morphs; very different topologies (e.g. a single blob morphing into text
 * with disconnected letters) may show simple straight-line-interpolation artifacts rather than an
 * optimized point-matching would produce. `target` must be (or resolve to) a `<path>` for
 * reliable cross-browser rendering - modern Chromium/Firefox also honor a `d` attribute override
 * on basic shape tags per SVG2, but that isn't universal yet.
 */
export class MorphAnimation extends Animation {
  private el: Element;
  private toShapeInput: SvgShapeInput;
  private ease: EaseFn;
  private precision: number;
  private fromPoints: Point[] = [];
  private toPoints: Point[] = [];
  private closed = false;

  constructor(target: SvgShapeInput, toShape: SvgShapeInput, vars: SvgMorphVars = {}) {
    super(vars);
    const defaults = getDefaults();
    this.el = resolveGeometry(target);
    this.toShapeInput = toShape;
    this.ease = resolveEase(vars.ease ?? defaults.ease);
    this.precision = Math.max(3, vars.precision ?? 120);
    this.duration(vars.duration ?? defaults.duration);
    this.render(0, true, true);
  }

  protected _onInit(): void {
    const toEl = resolveGeometry(this.toShapeInput);
    const fromD = shapeToPath(this.el);
    const toD = shapeToPath(toEl);

    this.closed = isClosed(fromD) && isClosed(toD);

    // Sampling (getTotalLength/getPointAtLength) only works on genuine <path>-shaped geometry -
    // a non-path source (circle/rect/...) needs its equivalent `d` (already computed above)
    // materialized into a throwaway detached path first.
    const fromShapeEl = this.el.tagName.toLowerCase() === "path" ? this.el : asPathElement(fromD);
    const toShapeEl = toEl.tagName.toLowerCase() === "path" ? toEl : asPathElement(toD);

    this.fromPoints = samplePoints(fromShapeEl, this.precision, this.closed);
    const rawToPoints = samplePoints(toShapeEl, this.precision, this.closed);
    this.toPoints = alignToFrom(this.fromPoints, rawToPoints, this.closed);
  }

  protected _renderIteration(localTime: number): void {
    const dur = this.duration() as number;
    const progress = dur ? localTime / dur : 1;
    const eased = this.ease(progress);
    const current = lerpPoints(this.fromPoints, this.toPoints, eased);
    this.el.setAttribute("d", pointsToBezierPath(current, this.closed));
  }
}

/** `six.svgMotion.morph(target, toShape, vars)` - animates `target`'s own `d` into `toShape`'s. */
export function morphSVG(target: SvgShapeInput, toShape: SvgShapeInput, vars: SvgMorphVars = {}): MorphAnimation {
  const anim = new MorphAnimation(target, toShape, vars);
  rootTimeline.add(anim);
  return anim;
}
