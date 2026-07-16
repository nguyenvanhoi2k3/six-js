export interface TransformCache {
  x: number;
  y: number;
  z: number;
  xPercent: number;
  yPercent: number;
  rotation: number;
  rotationX: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
}

export type TransformKey = keyof TransformCache;

const IDENTITY: TransformCache = {
  x: 0,
  y: 0,
  z: 0,
  xPercent: 0,
  yPercent: 0,
  rotation: 0,
  rotationX: 0,
  rotationY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
};

const caches = new WeakMap<Element, TransformCache>();

const MATRIX_RE = /^matrix\(([^)]+)\)$/;
const MATRIX3D_RE = /^matrix3d\(([^)]+)\)$/;
const RAD2DEG = 180 / Math.PI;

/**
 * Decomposes a raw CSS `matrix()`/`matrix3d()` string into cache fields, so a fresh tween
 * composes with whatever transform is already on the element instead of overwriting it. Only
 * the 2D matrix() case is fully decomposed (translate, rotation, scale, skew - via the standard
 * sqrt/atan2 decomposition); an existing matrix3d() only has its translate component read back,
 * with rotation/scale/skew on the 3D axes defaulting to identity. This is a deliberate Phase 1
 * scope cut - full 3D decomposition (recovering rotationX/rotationY/rotationZ from the matrix) is far
 * more code for a case that mostly matters when something OTHER than six-js already put a
 * complex 3D transform on the element. Exported standalone (rather than folded into
 * `getComputedStyle` reads) so the decomposition math is unit-testable without a real browser.
 */
export function parseMatrixString(raw: string): Partial<TransformCache> {
  if (!raw || raw === "none") return {};

  const matrix2d = raw.match(MATRIX_RE);
  if (matrix2d) {
    const [a, b, c, d, e, f] = matrix2d[1].split(",").map(Number);
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);
    const rotation = Math.atan2(b, a) * RAD2DEG;
    const skewX = (Math.atan2(c, d) * RAD2DEG + rotation) * -1;
    return { x: e, y: f, rotation, scaleX, scaleY, skewX: normalizeAngle(skewX) };
  }

  const matrix3d = raw.match(MATRIX3D_RE);
  if (matrix3d) {
    const m = matrix3d[1].split(",").map(Number);
    return { x: m[12], y: m[13], z: m[14] };
  }

  return {};
}

function parseExisting(target: Element): Partial<TransformCache> {
  if (typeof getComputedStyle === "undefined") return {};
  return parseMatrixString(getComputedStyle(target as HTMLElement).transform);
}

function normalizeAngle(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function isSvg(target: Element): boolean {
  return typeof SVGElement !== "undefined" && target instanceof SVGElement;
}

export function getTransformCache(target: Element): TransformCache {
  let cache = caches.get(target);
  if (!cache) {
    cache = { ...IDENTITY, ...parseExisting(target) };
    caches.set(target, cache);
  }
  return cache;
}

export function invalidateTransformCache(target: Element): void {
  caches.delete(target);
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Composes the cache into a single CSS transform string. `translate3d` (vs plain `translate`)
 * is preferred while `use3D` is true (the caller passes this only while a tween is actively
 * mid-flight) so elements aren't left on a GPU compositor layer once at rest - BUT a non-zero
 * `z` is always rendered via `translate3d` regardless of `use3D`, never silently dropped: `z`
 * is part of the element's actual final state (e.g. a tween ending at `z: 100`), whereas
 * `use3D` is purely a compositing-performance hint for the common `z === 0` case, not a license
 * to lose real data. Demoting a nonzero-`z` element to plain `translate()` at rest was a real
 * bug - the element's z-offset visibly snapped away the instant a tween settled.
 */
export function composeTransform(cache: TransformCache, use3D: boolean): string {
  const parts: string[] = [];

  if (cache.xPercent || cache.yPercent) {
    parts.push(`translate(${round(cache.xPercent)}%, ${round(cache.yPercent)}%)`);
  }

  if (cache.x || cache.y || cache.z) {
    parts.push(
      use3D || cache.z
        ? `translate3d(${round(cache.x)}px, ${round(cache.y)}px, ${round(cache.z)}px)`
        : `translate(${round(cache.x)}px, ${round(cache.y)}px)`,
    );
  }

  if (cache.rotation) parts.push(`rotate(${round(cache.rotation)}deg)`);
  if (cache.rotationX) parts.push(`rotateX(${round(cache.rotationX)}deg)`);
  if (cache.rotationY) parts.push(`rotateY(${round(cache.rotationY)}deg)`);
  if (cache.skewX) parts.push(`skewX(${round(cache.skewX)}deg)`);
  if (cache.skewY) parts.push(`skewY(${round(cache.skewY)}deg)`);
  if (cache.scaleX !== 1 || cache.scaleY !== 1) parts.push(`scale(${round(cache.scaleX)}, ${round(cache.scaleY)})`);

  return parts.length ? parts.join(" ") : "none";
}

export function renderTransform(target: Element, cache: TransformCache, use3D: boolean): void {
  (target as HTMLElement).style.transform = composeTransform(cache, use3D);
}

export { isSvg };
