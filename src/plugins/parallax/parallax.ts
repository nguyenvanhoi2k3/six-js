import { resolveTargets, TweenTarget } from "../../tween/tween";
import { ticker, TickerListener } from "../../core/ticker";
import { getTransformCache, renderTransform } from "../../animate/transform-cache";
import { acquirePointer, releasePointer, getPointerPosition } from "./parallax-pointer";
import { damp, resolveStrength } from "./parallax-motion";

export interface ParallaxVars {
  /**
   * Fallback max px offset (at the extreme cursor position, i.e. cursor at a viewport edge) for
   * any element with no `sx-parallax-strength` attribute of its own. Negative values are valid
   * and invert the movement direction - e.g. a background layer that should drift the OPPOSITE
   * way from the cursor, for a deeper depth illusion. No clamping. Default 30.
   */
  strength?: number;
  /**
   * 0-1 damping intensity for the lerped trailing motion - same field name/meaning/default as
   * `SmoothScrollVars.lerp` (`smooth-scroll/motion.ts`), so it reads as the same mental model
   * elsewhere in this codebase. 0/omitted means an instant 1:1 follow (no trailing). Default 0.1.
   */
  lerp?: number;
}

export interface ParallaxController {
  /**
   * Stops listening to mousemove and resets every managed element back to its pre-parallax base
   * transform, rather than leaving it at its last lerped offset - see `parallax()`'s own doc
   * comment for why this deliberately diverges from `burst()`'s "leave in place" default.
   */
  kill(): void;
}

const DEFAULT_STRENGTH = 30;
const DEFAULT_LERP = 0.1;
const SETTLE_EPSILON = 0.01;

interface ManagedElement {
  el: Element;
  strength: number;
  baseX: number;
  baseY: number;
}

/**
 * A mouse-move parallax effect: elements drift by different distances ("depth") in response to
 * the cursor's position across the whole `window`, giving a layered depth illusion (e.g. a hero
 * section where background shapes move less than foreground ones as the cursor moves). Each
 * element's own depth is set via a `sx-parallax-strength="N"` attribute (px of offset at the
 * extreme cursor position - a viewport edge; negative values invert the direction); `vars.strength`
 * is only the fallback for elements with no attribute of their own.
 *
 * Architecturally a HYBRID of two existing plugin patterns with no prior exact precedent in this
 * codebase: driven directly off the shared `ticker` (`core/ticker.ts`) like `burst()` - an ongoing
 * effect with no fixed duration, not an `Animation`/`Tween`/`Timeline` - but writing every frame
 * into the SAME shared per-element transform cache (`animate/transform-cache.ts`) `motion-path.ts`
 * uses, so a parallax offset composes additively with whatever other transform effect is already
 * on the element (e.g. an OnScroll reveal also animating x/y), instead of clobbering it the way a
 * raw `el.style.transform =` write (burst's own direct mode) would.
 *
 * CAVEAT: unlike a `Tween`, these writes are NOT tracked by `tween/overwrite.ts` (that system is
 * Tween-only) - a `six.to(el, { x: ... })` running concurrently on the same element will silently
 * fight with parallax's per-frame writes for as long as both run. For `motion-path` this risk is
 * minor since it's normally short-lived; for parallax it's more consequential since it has no
 * fixed duration and can run indefinitely.
 *
 * Smoothing uses the exact same `damp(from, to, lambda, deltaSeconds)` frame-rate-independent
 * decay formula as `smooth-scroll/motion.ts`'s own `lerp` option (`lambda = lerpAmount * 60`) -
 * duplicated locally in `parallax-motion.ts` rather than imported (see that file's own doc
 * comment). Unlike `burst()`'s closed-form absolute-time physics (constant velocity/gravity, no
 * per-frame delta needed), parallax's damping TARGET (the cursor) moves unpredictably, so it
 * genuinely needs `deltaMs` accumulated every tick - matches how `smooth-scroll.ts` itself drives
 * its own `ScrollMotion.advance(deltaMs / 1000)`.
 *
 * The shared cursor position is read from `parallax-pointer.ts`'s refcounted singleton (one
 * native `mousemove` listener total, no matter how many `parallax()` calls are active) - see that
 * file's own doc comment for why it's modeled on `on-scroll/observer.ts`'s resize listener rather
 * than `sticky.ts`'s per-element cache.
 *
 * Never measures layout (no `getBoundingClientRect()` anywhere) - it only applies a floating
 * transform delta on top of whatever transform state already exists, so unlike `on-scroll`/
 * `sticky` it's fully testable in jsdom with no rect-mocking gap.
 *
 * PERFORMANCE: the `ticker` listener itself is always-on for as long as an instance is alive (see
 * `core/ticker.ts`'s own "kept always-on" note - no `Animation`/autoSleep machinery here either),
 * but the per-element work inside it is not. Each managed element is skipped entirely once it's
 * already sitting on its current target (a still cursor converges every element and then does
 * zero further work) - without this, an idle mouse would still force a real `style.transform =`
 * write, and the style recalc/composite cost that comes with it, on every element, every single
 * frame, for as long as the instance lives. Only a cursor move (which changes the target) or an
 * element still mid-chase re-enters the write path.
 *
 * `kill()` resets every managed element back to its snapshotted base x/y, rather than leaving it
 * at its last lerped offset - a deliberate divergence from `burst()`'s "leave direct-mode elements
 * wherever they landed" default. Burst's trajectory IS the effect, so freezing it in place on kill
 * is correct; parallax's offset is a decorative wobble meant to be toggled on/off (mounted/
 * unmounted repeatedly in a SPA - a route change, a modal closing), and resetting to base keeps
 * repeated mount/unmount cycles idempotent instead of baking in whatever drift existed at the
 * moment of the last mouse move before unmount.
 *
 * Scope cuts (v1): whole-`window` `mousemove` only, no per-container/hover-scoped mode; no touch/
 * device-orientation input; no `pause()`/`resume()` (`kill()` only, matching `BurstController`
 * exactly - there's no `Animation` base class here to inherit them from, and half-implementing
 * them isn't worth it); not captured by `six.context()` scopes (matches `burst()` - neither is an
 * `Animation`/`Timeline`); not on the `six` object, subpath-only import like every plugin except
 * `OnScroll`'s convenience field.
 */
export function parallax(target: TweenTarget, vars: ParallaxVars = {}): ParallaxController {
  const elements = resolveTargets(target);
  const noop: ParallaxController = { kill() {} };

  if (elements.length === 0) {
    console.warn("[six-js] parallax() requires a resolvable target");
    return noop;
  }

  const fallbackStrength = vars.strength ?? DEFAULT_STRENGTH;
  const lerpAmount = vars.lerp ?? DEFAULT_LERP;

  // Snapshot each element's PRE-EXISTING base x/y once, same as motion-path.ts's baseX/baseY -
  // the parallax offset is added on top of whatever transform state already exists, never
  // replaces it.
  const managed: ManagedElement[] = elements.map((el) => {
    const cache = getTransformCache(el);
    return {
      el,
      strength: resolveStrength(el.getAttribute("sx-parallax-strength"), fallbackStrength),
      baseX: cache.x,
      baseY: cache.y,
    };
  });

  let killed = false;

  const tick: TickerListener = (_time, deltaMs) => {
    const { nx, ny } = getPointerPosition();
    const deltaSeconds = deltaMs / 1000;

    for (const item of managed) {
      const targetX = item.baseX + nx * item.strength;
      const targetY = item.baseY + ny * item.strength;
      const cache = getTransformCache(item.el);

      // PERFORMANCE: skip this element entirely once it's already sitting on its current target -
      // a still cursor means every managed element converges and then stays put, but the ticker
      // itself never stops calling this closure (see core/ticker.ts's own "kept always-on" note).
      // Without this guard, every element would get a redundant `getComputedStyle`-free but still
      // real `style.transform =` write EVERY frame forever, for as long as any parallax() instance
      // is alive - wasted style recalc/composite work (and battery) even while nothing is visually
      // changing. Checked BEFORE mutating the cache, not after, so a genuinely still frame does
      // zero work beyond this one distance check per element - only a cursor move (which changes
      // targetX/targetY) or an in-flight chase re-enters the write path below.
      const alreadySettled = Math.abs(cache.x - targetX) < SETTLE_EPSILON && Math.abs(cache.y - targetY) < SETTLE_EPSILON;
      if (alreadySettled) continue;

      cache.x = lerpAmount ? damp(cache.x, targetX, lerpAmount * 60, deltaSeconds) : targetX;
      cache.y = lerpAmount ? damp(cache.y, targetY, lerpAmount * 60, deltaSeconds) : targetY;

      // use3D only while still visibly chasing the target - matches transform-cache.ts's own
      // documented use3D convention (GPU-layer promotion only while actively animating).
      const settled = Math.abs(cache.x - targetX) < SETTLE_EPSILON && Math.abs(cache.y - targetY) < SETTLE_EPSILON;
      renderTransform(item.el, cache, !settled);
    }
  };

  acquirePointer();
  ticker.add(tick);
  tick(ticker.time, 0, ticker.currentFrame); // render frame 0 synchronously, same as every other six-js animation does on creation

  return {
    kill(): void {
      if (killed) return;
      killed = true;
      ticker.remove(tick);
      releasePointer();
      for (const item of managed) {
        const cache = getTransformCache(item.el);
        cache.x = item.baseX;
        cache.y = item.baseY;
        renderTransform(item.el, cache, false);
      }
    },
  };
}
