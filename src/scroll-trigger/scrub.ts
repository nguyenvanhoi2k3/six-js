import { ticker } from "../core/ticker";
import { Animation } from "../core/animation";

export interface ScrubController {
  update(targetProgress: number): void;
  kill(): void;
}

/** No smoothing: scroll position sets progress synchronously, 1:1. */
export function createDirectScrub(animation: Animation): ScrubController {
  return {
    update(targetProgress: number) {
      animation.totalProgress(targetProgress);
    },
    kill() {},
  };
}

/**
 * Smoothed scrub: each scroll update only retargets where we're headed - the eased approach
 * itself runs continuously off the shared ticker, decoupled from the scroll event stream (so it
 * keeps easing toward the target even after the user stops scrolling). Not implemented as a
 * helper Tween (unlike GSAP's `scrubTween.resetTo(...)`) because Tween is DOM-property-oriented;
 * this drives `animation.totalProgress` directly instead, which is simpler for a single plain
 * numeric value and needs no animate/registry involvement.
 */
export function createSmoothScrub(animation: Animation, smoothSeconds: number): ScrubController {
  let target = animation.totalProgress() as number;
  let current = target;
  let started = false;

  const tick = (_time: number, deltaMs: number): void => {
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
      if (!started) {
        started = true;
        current = target;
        animation.totalProgress(current);
      }
    },
    kill() {
      ticker.remove(tick);
    },
  };
}
