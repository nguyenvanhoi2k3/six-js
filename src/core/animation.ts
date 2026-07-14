import { ListNode } from "./linked-list";
import { resolveCycle, totalDurationOf } from "./cycle";

export type AnimationEvent = "start" | "update" | "complete" | "repeat" | "reverseComplete";

export interface AnimationVars {
  delay?: number;
  repeat?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  paused?: boolean;
  onStart?: () => void;
  onUpdate?: () => void;
  onComplete?: () => void;
  onRepeat?: () => void;
  onReverseComplete?: () => void;
}

/**
 * The structural surface a container (Timeline) exposes to its children. Kept as an
 * interface - rather than importing Timeline directly - so core/animation.ts has zero
 * dependency on timeline/timeline.ts. Timeline satisfies this purely by shape.
 */
export interface AnimationParent {
  _removeChild(child: Animation): void;
  _uncache(): void;
}

let uid = 0;

/**
 * Shared time model + lifecycle for anything playable (Tween and Timeline both extend this,
 * and only this - see the architecture doc for why one shared base, not a wrapper, is the point).
 *
 * Time flows top-down as a coordinate transform (see Timeline's parent->child conversion): a
 * container calls `child.render(totalTime)` with `totalTime` already expressed on the child's
 * OWN axis. `render()` here handles everything generic - clamping, delay, repeat/yoyo cycling,
 * and start/update/repeat/complete event bookkeeping - then hands off to the abstract
 * `_renderIteration` for the part that differs between a Tween (interpolate properties) and a
 * Timeline (recurse into children).
 */
export abstract class Animation implements ListNode<Animation> {
  readonly id = ++uid;

  parent: AnimationParent | null = null;
  /** Kept after removal from `parent` (GSAP calls this the "detached parent") so time queries made after removal still resolve. */
  protected _dp: AnimationParent | null = null;

  _next: Animation | null = null;
  _prev: Animation | null = null;

  protected _start = 0;
  protected _dur = 0;
  protected _tDur = 0;
  protected _time = 0;
  protected _tTime = 0;

  /** Functional timeScale - forced to 0 while paused. `_ts === 0` IS the definition of paused. */
  protected _ts = 1;
  /** Recorded/user timeScale - preserved through pause so resume restores speed+direction. Sign IS the definition of reversed. */
  protected _rts = 1;

  protected _delay: number;
  protected _repeat: number;
  protected _repeatDelay: number;
  protected _yoyo: boolean;

  protected _initted = false;
  protected _dirty = true;
  protected _hasStarted = false;

  private listeners: Partial<Record<AnimationEvent, Set<() => void>>> = {};

  constructor(vars: AnimationVars = {}) {
    this._delay = Math.max(0, vars.delay ?? 0);
    this._repeat = vars.repeat ?? 0;
    this._repeatDelay = Math.max(0, vars.repeatDelay ?? 0);
    this._yoyo = vars.yoyo ?? false;

    if (vars.onStart) this.on("start", vars.onStart);
    if (vars.onUpdate) this.on("update", vars.onUpdate);
    if (vars.onComplete) this.on("complete", vars.onComplete);
    if (vars.onRepeat) this.on("repeat", vars.onRepeat);
    if (vars.onReverseComplete) this.on("reverseComplete", vars.onReverseComplete);

    if (vars.paused) this._ts = 0;
  }

  // ---- rendering ----

  /**
   * Renders this animation at `totalTime` (on ITS OWN axis, delay included at the front).
   * `suppressEvents` skips start/update/repeat/complete callbacks (used by seek()). `force`
   * re-renders even if `totalTime` hasn't changed since the last render.
   */
  render(totalTime: number, suppressEvents = false, force = false): void {
    const prevTotalTime = this._tTime;
    const tDur = this.totalDuration() as number;

    let clamped = totalTime;
    if (clamped < 0) clamped = 0;
    else if (this._repeat >= 0 && clamped > tDur) clamped = tDur;

    if (!force && this._initted && clamped === prevTotalTime) return;

    if (!this._initted) {
      this._initted = true;
      this._onInit();
    }

    const cycle = resolveCycle(clamped - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo);

    this._tTime = clamped;
    this._time = cycle.time;

    this._renderIteration(cycle.time, cycle.reversed, cycle.iteration, suppressEvents);

    if (suppressEvents) return;

    const isBefore = clamped <= 0;
    const isAfter = this._repeat >= 0 && clamped >= tDur;
    const wasAfter = this._repeat >= 0 && prevTotalTime >= tDur;
    const wasBefore = prevTotalTime <= 0;

    if (!this._hasStarted && !isBefore) {
      this._hasStarted = true;
      this.emit("start");
    }

    if (clamped > prevTotalTime) {
      const prevCycle = resolveCycle(prevTotalTime - this._delay, this._dur, this._repeat, this._repeatDelay, this._yoyo);
      if (cycle.iteration !== prevCycle.iteration) this.emit("repeat");
    }

    this.emit("update");

    if (clamped > prevTotalTime && !wasAfter && isAfter) {
      this.emit("complete");
    } else if (clamped < prevTotalTime && !wasBefore && isBefore) {
      this.emit("reverseComplete");
    }
  }

  /** Applies this animation's own visual state for `localTime` (0..duration, already yoyo-flipped). */
  protected abstract _renderIteration(localTime: number, reversed: boolean, iteration: number, suppressEvents: boolean): void;

  /** Hook for subclasses that need to do one-time setup on first render (e.g. Tween building its PropertyTracks). */
  protected _onInit(): void {}

  // ---- duration ----

  duration(value?: number): number | this {
    if (value === undefined) return this._dur;
    this._dur = Math.max(0, value);
    this.invalidate();
    this._uncache();
    return this;
  }

  totalDuration(value?: number): number | this {
    if (value === undefined) {
      if (this._dirty) this._recomputeTotalDuration();
      return this._tDur;
    }
    const cur = this.totalDuration() as number;
    if (cur > 0 && value > 0) this.timeScale((this.timeScale() as number) * (cur / value));
    return this;
  }

  protected _recomputeTotalDuration(): void {
    this._tDur = this._delay + totalDurationOf(this._dur, this._repeat, this._repeatDelay);
    this._dirty = false;
  }

  _uncache(): void {
    this._dirty = true;
    this.parent?._uncache();
  }

  // ---- repeat / yoyo / delay ----

  repeat(value?: number): number | this {
    if (value === undefined) return this._repeat;
    this._repeat = value;
    this._uncache();
    return this;
  }

  repeatDelay(value?: number): number | this {
    if (value === undefined) return this._repeatDelay;
    this._repeatDelay = Math.max(0, value);
    this._uncache();
    return this;
  }

  yoyo(value?: boolean): boolean | this {
    if (value === undefined) return this._yoyo;
    this._yoyo = value;
    return this;
  }

  delay(value?: number): number | this {
    if (value === undefined) return this._delay;
    this._delay = Math.max(0, value);
    this._uncache();
    return this;
  }

  startTime(value?: number): number | this {
    if (value === undefined) return this._start;
    this._start = value;
    this.parent?._uncache();
    return this;
  }

  endTime(): number {
    return this._start + (this.totalDuration() as number) / Math.abs(this._rts || 1);
  }

  // ---- time scale / direction ----

  timeScale(value?: number): number | this {
    if (value === undefined) return this._rts;
    // 0 would lose direction (sign) information, so nudge to a value indistinguishable from
    // zero in practice - mirrors GSAP's tiny-epsilon trick for the same reason.
    if (value === 0) value = this._rts < 0 ? -1e-8 : 1e-8;
    const wasPaused = this._ts === 0;
    this._rts = value;
    this._ts = wasPaused ? 0 : value;
    return this;
  }

  reversed(value?: boolean): boolean | this {
    if (value === undefined) return this._rts < 0;
    this.timeScale(value ? -Math.abs(this._rts) : Math.abs(this._rts));
    return this;
  }

  // ---- paused / play state ----

  paused(value?: boolean): boolean | this {
    if (value === undefined) return this._ts === 0;
    this._ts = value ? 0 : this._rts;
    return this;
  }

  play(): this {
    this.paused(false);
    return this;
  }

  pause(): this {
    this.paused(true);
    return this;
  }

  resume(): this {
    return this.play();
  }

  reverse(): this {
    this.reversed(true);
    return this.play();
  }

  restart(includeDelay = false): this {
    this._hasStarted = false;
    this.totalTime(includeDelay ? -this._delay : 0, true);
    return this.play();
  }

  // ---- time / totalTime / progress ----

  totalTime(value?: number, suppressEvents = false): number | this {
    if (value === undefined) return this._tTime;
    this.render(value, suppressEvents, false);
    return this;
  }

  time(value?: number, suppressEvents = false): number | this {
    if (value === undefined) return this._time;
    const iterationStart = this._tTime - this._delay - this._time;
    return this.totalTime(this._delay + iterationStart + Math.max(0, Math.min(value, this._dur)), suppressEvents);
  }

  progress(value?: number): number | this {
    if (value === undefined) return this._dur ? this._time / this._dur : 1;
    return this.time((value as number) * this._dur);
  }

  totalProgress(value?: number): number | this {
    const tDur = this.totalDuration() as number;
    if (value === undefined) return tDur ? this._tTime / tDur : 1;
    return this.totalTime((value as number) * tDur);
  }

  seek(position: number, suppressEvents = true): this {
    this.totalTime(position, suppressEvents);
    return this;
  }

  // ---- lifecycle ----

  invalidate(): this {
    this._initted = false;
    return this;
  }

  kill(): this {
    if (this.parent) {
      this._dp = this.parent;
      this.parent._removeChild(this);
      this.parent = null;
    }
    return this;
  }

  isActive(): boolean {
    const tDur = this.totalDuration() as number;
    return !this.paused() && !!this.parent && this._tTime > 0 && (tDur === Infinity || this._tTime < tDur);
  }

  // ---- events ----

  on(event: AnimationEvent, cb: () => void): this {
    (this.listeners[event] ??= new Set()).add(cb);
    return this;
  }

  off(event: AnimationEvent, cb: () => void): this {
    this.listeners[event]?.delete(cb);
    return this;
  }

  protected emit(event: AnimationEvent): void {
    this.listeners[event]?.forEach((cb) => cb());
  }
}
