import { EaseFn } from "../../easing/easing";

/** Linearly interpolate between `from` and `to` by `t` (0-1, unclamped). */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * Frame-rate-independent exponential damping toward `to` - the continuous "chase" that makes
 * wheel-driven smooth scrolling feel fluid rather than choppy, instead of a naive
 * `value += (to - value) * factor` per frame (which is frame-rate DEPENDENT - the same bug class
 * already fixed once in this codebase's own on-scroll/sync.ts, see its history). `lambda` is a
 * decay rate, not the raw 0-1 intensity users configure - see ScrollMotion.retarget, which
 * multiplies by 60 to turn an intensity tuned "by feel" at 60fps into a real rate independent of
 * the caller's actual frame rate. Verified against Lenis's own maths.ts (`damp`), the reference
 * this plugin is modeled on.
 * https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
 */
export function damp(from: number, to: number, lambda: number, deltaSeconds: number): number {
  return lerp(from, to, 1 - Math.exp(-lambda * deltaSeconds));
}

export interface MotionVars {
  /** 0-1 damping intensity, tuned for 60fps (matches Lenis's own well-tested default feel) - mutually exclusive with duration/ease; omitted/0 means "no smoothing, jump instantly". */
  lerp?: number;
  /** Seconds - switches to a fixed-duration eased tween instead of continuous damping. */
  duration?: number;
  ease?: EaseFn;
}

/**
 * A single scalar that chases a moving target, either via continuous damping (the wheel-driven
 * "lerp" feel) or a fixed-duration eased tween (typical for a programmatic scrollTo) - never
 * both at once, and with no notion of scroll/DOM/clamping at all (the caller resolves and clamps
 * a plain target number before calling retarget()).
 *
 * Retargeting mid-flight behaves differently per mode - matches Lenis's own Animate class
 * (verified against packages/core/src/animate.ts): damping just redirects the existing chase
 * toward the new target from wherever `value` currently sits (a continuous decay has no notion
 * of "elapsed time" to reset), while duration/ease mode restarts a fresh tween from the current
 * value with elapsed reset to 0 - without that reset, retargeting mid-tween would jump/skip
 * instead of easing smoothly from wherever it currently is.
 */
export class ScrollMotion {
  value: number;

  private to: number;
  private from: number;
  private elapsed = 0;
  private duration?: number;
  private ease?: EaseFn;
  private lerpAmount?: number;

  constructor(initial: number) {
    this.value = this.to = this.from = initial;
  }

  get target(): number {
    return this.to;
  }

  get isSettled(): boolean {
    return this.value === this.to;
  }

  /** Redirects the chase toward `target` using `vars` (always re-specified by the caller, matching Lenis's own call sites - see wheel.ts/scroll-to.ts callers, which always know their own mode). */
  retarget(target: number, vars: MotionVars): void {
    this.duration = vars.duration;
    this.ease = vars.duration !== undefined ? vars.ease : undefined;
    this.lerpAmount = vars.duration === undefined ? vars.lerp : undefined;
    this.from = this.value;
    this.to = target;
    this.elapsed = 0;
  }

  /** Instantly moves both the current value and target to `v` - no animation, e.g. for resize reconciliation. */
  jump(v: number): void {
    this.value = this.to = this.from = v;
    this.elapsed = 0;
  }

  /** Advances by `deltaSeconds`. Returns true on the exact call where `value` reaches `to` (fires once, not on every already-settled call after). */
  advance(deltaSeconds: number): boolean {
    if (this.value === this.to) return false;

    if (this.duration !== undefined && this.ease) {
      this.elapsed += deltaSeconds;
      const linear = this.duration > 0 ? Math.min(this.elapsed / this.duration, 1) : 1;
      const completed = linear >= 1;
      this.value = completed ? this.to : this.from + (this.to - this.from) * this.ease(linear);
      return completed;
    }

    if (this.lerpAmount) {
      this.value = damp(this.value, this.to, this.lerpAmount * 60, deltaSeconds);
      if (Math.round(this.value) === Math.round(this.to)) this.value = this.to;
      return this.value === this.to;
    }

    this.value = this.to;
    return true;
  }
}
