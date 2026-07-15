import { ticker } from "../core/ticker";
import { Animation } from "../core/animation";

export interface ScrubController {
  /** Scroll-driven: smoothed (or direct, for non-smooth mode). */
  update(targetProgress: number): void;
  /** Recalculation-driven (refresh()): always instant, never animates - see createSmoothScrub. */
  snapTo(progress: number): void;
  kill(): void;
}

/** No smoothing: scroll position sets progress synchronously, 1:1. */
export function createDirectScrub(animation: Animation): ScrubController {
  const set = (progress: number): void => {
    animation.totalProgress(progress);
  };
  return { update: set, snapTo: set, kill() {} };
}

/**
 * Smoothed scrub: each scroll update only retargets where we're headed - the eased approach
 * itself runs continuously off the shared ticker, decoupled from the scroll event stream (so it
 * keeps easing toward the target even after the user stops scrolling). Not implemented as a
 * helper Tween (unlike GSAP's `scrubTween.resetTo(...)`) because Tween is DOM-property-oriented;
 * this drives `animation.totalProgress` directly instead, which is simpler for a single plain
 * numeric value and needs no animate/registry involvement.
 *
 * `snapTo()` vs `update()`: reloading mid-page on a real site is a real, common trigger for a
 * visible bug here - the browser's own async scroll-position restoration on reload doesn't
 * always land before this controller's first read of `window.scrollY`, so `refresh()`'s own
 * synchronous update can see a STALE scroll position (e.g. 0) and correctly-but-uselessly
 * "settle" there, only for the browser's restoration to fire its own native `scroll` event a
 * moment later with the real position. If that later event were treated as an ordinary scrub
 * update, it would SMOOTH from the stale reading to the real one - i.e. the tween visibly
 * "rewinds" to 0 and eases back into place on every reload, even though nothing the user did
 * should have caused any animation at all. Two mitigations, applied together because neither
 * alone is airtight (browser restoration timing isn't specified/guaranteed):
 * - `refresh()` (ScrollTrigger.refresh(), including the one triggered by the `load` event -
 *   see observer.ts) always calls `snapTo()`, never `update()` - a recalculation should
 *   reposition instantly, full stop, regardless of how much the target moved.
 * - `update()` itself keeps snapping instantly (not smoothing) until this scrub's own ticker
 *   tick has fired at least once - i.e. through the first real animation frame after creation,
 *   which is when a same-frame or near-same-frame restoration `scroll` event is most likely to
 *   land, covering the case where refresh()'s own initial read was already the stale one.
 */
export function createSmoothScrub(animation: Animation, smoothSeconds: number): ScrubController {
  let target = animation.totalProgress() as number;
  let current = target;
  let settled = false;

  const tick = (_time: number, deltaMs: number): void => {
    settled = true;
    const dt = deltaMs / 1000;
    const factor = 1 - Math.exp((-3 * dt) / Math.max(0.05, smoothSeconds));
    current += (target - current) * factor;
    if (Math.abs(target - current) < 0.0005) current = target;
    animation.totalProgress(current);
  };

  ticker.add(tick);

  return {
    update(targetProgress: number) {
      target = targetProgress;
      if (!settled) {
        current = target;
        animation.totalProgress(current);
      }
    },
    snapTo(progress: number) {
      target = progress;
      current = progress;
      animation.totalProgress(current);
    },
    kill() {
      ticker.remove(tick);
    },
  };
}
