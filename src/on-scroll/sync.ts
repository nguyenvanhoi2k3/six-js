import { ticker } from "../core/ticker";
import { Animation } from "../core/animation";
import { EASES } from "../easing/easing";

export interface SyncController {
  /** Scroll-driven: smoothed (or direct, for non-smooth mode). */
  update(targetProgress: number): void;
  /** Recalculation-driven (refresh()): always instant, never animates - see createSmoothSync. */
  snapTo(progress: number): void;
  kill(): void;
}

/** No smoothing: scroll position sets progress synchronously, 1:1. */
export function createDirectSync(animation: Animation): SyncController {
  const set = (progress: number): void => {
    animation.totalProgress(progress);
  };
  return { update: set, snapTo: set, kill() {} };
}

/**
 * Smoothed sync: an `ease: "expo"` (expo.out) interpolation from the CURRENT progress to a new
 * target, that restarts fresh (elapsed reset to 0) every time `update()` retargets it, over
 * exactly `smoothSeconds` - not a continuous, never-restarting exponential-decay loop (which has
 * a much weaker initial response than expo.out and visibly lags behind for the same declared
 * sync number).
 *
 * `snapTo()` vs `update()`: reloading mid-page on a real site is a real, common trigger for a
 * visible bug here - the browser's own async scroll-position restoration on reload doesn't
 * always land before this controller's first read of `window.scrollY`, so `refresh()`'s own
 * synchronous update can see a STALE scroll position (e.g. 0) and correctly-but-uselessly
 * "settle" there, only for the browser's restoration to fire its own native `scroll` event a
 * moment later with the real position. If that later event were treated as an ordinary sync
 * update, it would SMOOTH from the stale reading to the real one - i.e. the tween visibly
 * "rewinds" to 0 and eases back into place on every reload, even though nothing the user did
 * should have caused any animation at all. Two mitigations, applied together because neither
 * alone is airtight (browser restoration timing isn't specified/guaranteed):
 * - `refresh()` (OnScroll.refresh(), including the one triggered by the `load` event -
 *   see observer.ts) always calls `snapTo()`, never `update()` - a recalculation should
 *   reposition instantly, full stop, regardless of how much the target moved.
 * - `update()` itself keeps snapping instantly (not smoothing) until this sync's own ticker
 *   tick has fired at least once - i.e. through the first real animation frame after creation,
 *   which is when a same-frame or near-same-frame restoration `scroll` event is most likely to
 *   land, covering the case where refresh()'s own initial read was already the stale one.
 */
export function createSmoothSync(animation: Animation, smoothSeconds: number): SyncController {
  const duration = Math.max(0.05, smoothSeconds);
  const ease = EASES.expoOut;

  let from = animation.totalProgress() as number;
  let to = from;
  let elapsed = duration;
  let settled = false;

  const tick = (_time: number, deltaMs: number): void => {
    settled = true;
    if (elapsed >= duration) return;
    elapsed = Math.min(duration, elapsed + deltaMs / 1000);
    animation.totalProgress(from + (to - from) * ease(elapsed / duration));
  };

  ticker.add(tick);

  return {
    update(targetProgress: number) {
      if (!settled) {
        from = targetProgress;
        to = targetProgress;
        elapsed = duration;
        animation.totalProgress(targetProgress);
        return;
      }
      from = animation.totalProgress() as number;
      to = targetProgress;
      elapsed = 0;
    },
    snapTo(progress: number) {
      from = progress;
      to = progress;
      elapsed = duration;
      animation.totalProgress(progress);
    },
    kill() {
      ticker.remove(tick);
    },
  };
}
