import { ticker, TickerListener } from "../../core/ticker";
import { getActiveScope } from "../../core/context";
import { EaseFn, resolveEase } from "../../easing/easing";
import { clamp } from "../../utils/utils";
import { addResizeListener, Axis, getMaxScroll, getScroll, getViewportSize, invalidateReads, removeResizeListener, resolveScroller, Scroller, setScroll } from "../on-scroll/observer";
import { MotionVars, ScrollMotion } from "./motion";
import { normalizeWheel } from "./wheel";
import { resolveScrollTarget, ScrollToTarget } from "./scroll-to";

export type SmoothScrollEvent = "scroll" | "start" | "stop";

export interface SmoothScrollVars {
  /** Same meaning/values as `OnScrollVars.scroller` - window (default) or an Element/selector. Smoothing a nested `overflow` container works the same way OnScroll already targets one. */
  scroller?: Scroller | string;
  /** Same meaning as `OnScrollVars.axis` - default "y". */
  axis?: Axis;
  /** 0-1 damping intensity applied to wheel input, tuned for 60fps (matches Lenis's own well-tested default feel). Ignored once `duration` is set. @default 0.1 */
  lerp?: number;
  /** Seconds - set this (instead of `lerp`) to drive wheel-input motion as a fixed-duration eased tween rather than continuous damping. */
  duration?: number;
  /** Matches TweenVars.ease's shape (six-js ease name or function) - used only when `duration` is set. @default "expoOut" */
  ease?: string | EaseFn;
  wheelMultiplier?: number;
  onScroll?: (self: SmoothScroll) => void;
  onStart?: (self: SmoothScroll) => void;
  onStop?: (self: SmoothScroll) => void;
}

export interface ScrollToOptions {
  offset?: number;
  /** Skip the animation and jump straight to the target. */
  immediate?: boolean;
  /** Ignore wheel input until this scrollTo settles. */
  lock?: boolean;
  /** Scroll even while stop()ped. */
  force?: boolean;
  lerp?: number;
  duration?: number;
  ease?: string | EaseFn;
  onStart?: (self: SmoothScroll) => void;
  onComplete?: (self: SmoothScroll) => void;
}

const DEFAULT_LERP = 0.1;

/**
 * A Lenis-modeled smooth-scrolling driver, adapted to six-js's own architecture and naming
 * rather than ported 1:1 (see CLAUDE.md's own precedent with OnScroll/Breakpoint - "reads as
 * six-js's own", not a renamed wrapper around someone else's API).
 *
 * The one design decision everything else follows from: this moves the REAL native scroll
 * position (`window.scrollTo`/`el.scrollTop`, via the exact same on-scroll/observer.ts helpers
 * OnScroll itself reads through), not a `transform` on a wrapper/content pair. That's also what
 * modern Lenis (v2, the version this is modeled on) itself does - verified by reading
 * packages/core/src/lenis.ts rather than assumed from older Lenis writeups that describe the
 * transform-based approach. Consequences of that choice, all wanted:
 * - OnScroll needs zero changes or awareness of this class - it already reads scroll position
 *   and listens for native "scroll" events through the same Scroller abstraction.
 * - Native anchor links, find-in-page, IntersectionObserver, screen readers, etc. all keep
 *   working unmodified - nothing about "what scrolling even is" changes for the rest of the page.
 * - After every position write this also dispatches a synthetic native-shaped "scroll" Event
 *   synchronously (see applyScroll) - the real browser-originated scroll event that follows is
 *   asynchronous (queued, not same-tick), which would otherwise put OnScroll's progress update a
 *   frame behind. This mirrors GSAP's own documented Lenis+ScrollTrigger integration guidance
 *   (wire `lenis.on('scroll', ScrollTrigger.update)` rather than relying on native event timing),
 *   just via a plain DOM event instead of a bespoke callback wire, so it benefits ANY listener on
 *   the page, not only six-js's own.
 *
 * Deliberate departures from Lenis, each reasoned through rather than copied blind:
 * - `velocity` is real px/second (divides by elapsed time), not Lenis's raw per-update pixel
 *   delta (frame-rate DEPENDENT - the same magnitude delta reads as a different "speed" at 60fps
 *   vs 144hz). Free to compute correctly here since the caller (tick/onNativeScroll) always has
 *   real elapsed time on hand; no reason to inherit a shortcut that isn't actually more correct.
 * - A content ResizeObserver (catches e.g. a lazy-loaded image growing the page, which neither a
 *   window resize nor a scroll event would ever fire for) only refreshes the clamp limit - it
 *   does NOT cancel/snap in-flight motion the way an explicit window resize does. Real Lenis
 *   treats every resize identically (snap unconditionally), which is fine for a plain window
 *   resize (rare, expected to jar) but would be actively disruptive here: this library ships
 *   alongside six-js's own Tween/Timeline, so *some* element resizing while the user is mid
 *   wheel-scroll is a routine occurrence, not a rare edge case, and shouldn't keep interrupting
 *   their scroll.
 * - Touch scrolling itself is left fully native - matches Lenis's OWN default
 *   (`syncTouch: false`) rather than a fabricated "safer default"; real touch momentum already
 *   feels right and reimplementing it in JS is a well-known way to make it feel worse. No
 *   touch-smoothing toggle in v1 - a documented scope cut, not an oversight. The one exception:
 *   a touchmove listener DOES exist purely to preventDefault while stopped/locked (see
 *   onTouchMove) - added specifically so stop() (e.g. for a modal) actually freezes the
 *   background on touch devices too, not just wheel; it does nothing at all otherwise.
 * - No `infinite` looping mode - needs the consumer to duplicate DOM content to work at all, and
 *   isn't needed for the ask this plugin exists to satisfy (correctness + OnScroll integration).
 * - Method/event naming matches six-js's own vocabulary, not Lenis's: `kill()` not `destroy()`
 *   (matches Tween/Timeline/OnScroll/Breakpoint), `scroller`/`axis` vars (matches
 *   OnScrollVars exactly, not Lenis's `wrapper`/`orientation`), `on()/off()` return `this`
 *   (matches Animation.on/off) rather than Lenis's unsubscribe-function return. The `ease` option
 *   is named and shaped exactly like `TweenVars.ease` (a six-js ease NAME via resolveEase, or a
 *   raw function) - not Lenis's `easing` (function-only) - so it reads the same as everywhere
 *   else in six-js, not differently just because this feature happens to be modeled on Lenis.
 */
export class SmoothScroll {
  readonly vars: SmoothScrollVars;

  private scroller: Scroller;
  private axis: Axis;

  private motion: ScrollMotion;
  private limit = 0;

  private animating = false;
  private stopped = false;
  private locked = false;
  private killed = false;

  private lastValue = 0;
  private lastMoveTime = 0;
  private _velocity = 0;
  private _direction: 1 | -1 | 0 = 0;

  private pendingOnComplete?: (self: SmoothScroll) => void;

  private listeners: Partial<Record<SmoothScrollEvent, Set<(self: SmoothScroll) => void>>> = {};

  private resizeObserver: ResizeObserver | null = null;

  private readonly boundWheel = (e: WheelEvent): void => this.onWheel(e);
  private readonly boundTouchMove = (e: TouchEvent): void => this.onTouchMove(e);
  private readonly boundNativeScroll = (): void => this.onNativeScroll();
  private readonly boundWindowResize = (): void => this.onWindowResize();
  private readonly boundTick: TickerListener = (_time, deltaMs): void => this.tick(deltaMs);

  constructor(vars: SmoothScrollVars = {}) {
    this.vars = vars;
    this.scroller = resolveScroller(vars.scroller);
    this.axis = vars.axis ?? "y";

    const initial = getScroll(this.scroller, this.axis);
    this.motion = new ScrollMotion(initial);
    this.lastValue = initial;
    this.lastMoveTime = this.now();
    this.limit = getMaxScroll(this.scroller, this.axis);

    getActiveScope()?._capture(this);

    this.scroller.addEventListener("wheel", this.boundWheel as EventListener, { passive: false });
    // Touch itself stays native/unsmoothed (see the class doc) - this listener only ever
    // preventDefaults while stopped/locked, so a modal-style stop() also blocks touch-drag
    // scrolling of the background, not just wheel. { passive: false } is required for
    // preventDefault to have any effect here.
    this.scroller.addEventListener("touchmove", this.boundTouchMove as EventListener, { passive: false });
    // Not addScrollListener() (OnScroll's shared listener-Set) - registering a raw native
    // listener directly means this ALSO receives this instance's own synthetic dispatch from
    // applyScroll() (see onNativeScroll's `this.animating` guard), which is required - it's how
    // an interrupted-by-external-scroll case (scrollbar drag, keyboard, native touch) is caught.
    this.scroller.addEventListener("scroll", this.boundNativeScroll, { passive: true });
    addResizeListener(this.boundWindowResize);
    this.observeContentResize();

    this.updateClassName();
    ticker.add(this.boundTick);
  }

  // ---- per-frame motion ----

  private tick(deltaMs: number): void {
    if (this.killed || !this.animating) return;

    const before = this.motion.value;
    const settledNow = this.motion.advance(deltaMs / 1000);

    if (this.motion.value !== before) this.commitPosition(this.motion.value);

    if (settledNow) {
      this.animating = false;
      this.locked = false;
      this.updateClassName();
      const onComplete = this.pendingOnComplete;
      this.pendingOnComplete = undefined;
      onComplete?.(this);
      this.emit("stop");
    }
  }

  private onWheel(e: WheelEvent): void {
    // Respects a veto from some OTHER listener that already called preventDefault() on this same
    // event (e.g. sx-dialog's own scroll lock while a modal is open) - SmoothScroll moving the
    // page via an explicit scrollTo() call is otherwise completely invisible to anything that
    // only calls preventDefault(), since that only suppresses the BROWSER's own default wheel
    // behavior, not other JS code's independent scroll writes. This is why such a veto must be
    // registered in the capture phase (fires before this bubble-phase listener regardless of
    // script load order) - see sx-dialog's own comment on this for the other half of the contract.
    if (this.killed || e.ctrlKey || e.defaultPrevented) return;

    const { deltaX, deltaY } = normalizeWheel(e, getViewportSize(this.scroller, "x"), getViewportSize(this.scroller, "y"), this.vars.wheelMultiplier ?? 1);
    // Horizontal instances deliberately accept whichever axis of input is larger (so an ordinary
    // vertical mouse wheel drives a horizontal gallery, a well-known affordance most mice/trackpads
    // rely on since horizontal wheel input is rare) - vertical instances only ever read deltaY, so
    // a purely horizontal trackpad swipe doesn't leak into vertical scroll. Verified against
    // Lenis's own gestureOrientation handling (defaults to "both" only when orientation:
    // "horizontal"), not invented.
    const delta = this.axis === "x" ? (Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX) : deltaY;
    if (delta === 0) return;

    if (e.cancelable) e.preventDefault();
    if (this.stopped || this.locked) return;

    this.pendingOnComplete = undefined;
    const target = clamp(0, this.limit, this.motion.target + delta);
    this.retarget(target, this.resolveMotionVars());
  }

  /** Touch is otherwise left fully native (see the class doc) - this exists ONLY to block it while stopped/locked, e.g. so a modal's stop() actually freezes the background on mobile too, not just wheel. */
  private onTouchMove(e: TouchEvent): void {
    if (this.killed || !(this.stopped || this.locked)) return;
    if (e.cancelable) e.preventDefault();
  }

  /** Reconciles internal state after a scroll this instance didn't cause itself - scrollbar drag, keyboard (Home/End/PageDown/Space), native touch (untouched by default), or any other code's own programmatic scroll. Guarded on `animating` because this also receives this instance's OWN synthetic + trailing-native events from applyScroll(), which must be ignored - see the class doc. */
  private onNativeScroll(): void {
    if (this.killed || this.animating) return;

    // This listener is a raw addEventListener, not on-scroll/observer.ts's own addScrollListener
    // - so unlike an OnScroll instance (which always shares a scroller with at least one
    // invalidateReads()-calling handler), nothing guarantees the read cache has been invalidated
    // for this scroller yet when NO OnScroll happens to be watching the same one. Must invalidate
    // explicitly, or a genuine external scroll (scrollbar drag, keyboard) can read back a stale
    // cached position and silently fail to reconcile.
    invalidateReads();
    const actual = getScroll(this.scroller, this.axis);
    if (actual === this.motion.value) return;

    this.motion.jump(actual);
    this.recordVelocity(actual);
    this.emit("scroll");
  }

  private retarget(target: number, motionVars: MotionVars): void {
    this.motion.retarget(target, motionVars);
    if (!this.animating) {
      this.animating = true;
      this.updateClassName();
    }
  }

  private commitPosition(value: number): void {
    this.applyScroll(value);
    this.recordVelocity(value);
    this.emit("scroll");
  }

  private applyScroll(value: number): void {
    setScroll(this.scroller, this.axis, value);
    // Synchronous, same-tick notification - see the class doc's "Consequences" section for why
    // this matters instead of relying solely on the real (asynchronous) native scroll event that
    // this same setScroll() call also triggers a moment later.
    this.scroller.dispatchEvent(new Event("scroll"));
  }

  private now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  private recordVelocity(newValue: number): void {
    const t = this.now();
    const dt = (t - this.lastMoveTime) / 1000;
    this._velocity = dt > 0 ? (newValue - this.lastValue) / dt : 0;
    this._direction = this._velocity > 0 ? 1 : this._velocity < 0 ? -1 : 0;
    this.lastValue = newValue;
    this.lastMoveTime = t;
  }

  private resolveMotionVars(opts?: { lerp?: number; duration?: number; ease?: string | EaseFn }): MotionVars {
    let duration = opts?.duration ?? this.vars.duration;
    let ease = opts?.ease ?? this.vars.ease;

    // Setting only one of duration/ease (per-call or at the instance level) still switches to
    // duration+ease mode - matches Lenis's own ergonomics (scrollTo(el, {duration: 1.5}) alone
    // just works, without also requiring an explicit ease).
    if (duration !== undefined && ease === undefined) ease = "expoOut";
    else if (duration === undefined && ease !== undefined) duration = 1;

    if (duration !== undefined) return { duration, ease: resolveEase(ease) };
    return { lerp: opts?.lerp ?? this.vars.lerp ?? DEFAULT_LERP };
  }

  // ---- resize ----

  private observeContentResize(): void {
    if (typeof ResizeObserver === "undefined") return;
    const content = this.scroller === window ? document.documentElement : (this.scroller as Element);
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.killed) this.limit = getMaxScroll(this.scroller, this.axis);
    });
    this.resizeObserver.observe(content);
  }

  private onWindowResize(): void {
    if (this.killed) return;
    this.limit = getMaxScroll(this.scroller, this.axis);

    // An explicit window/viewport resize snaps unconditionally, cancelling any in-flight motion -
    // matches Lenis's own resize() exactly (verified: it reconciles regardless of isScrolling).
    // Rare enough, and jarring enough on its own, that preserving an in-flight animation across it
    // isn't worth the complexity - unlike the content ResizeObserver above, which deliberately does
    // NOT do this (see the class doc).
    const actual = getScroll(this.scroller, this.axis);
    this.motion.jump(actual);
    this.animating = false;
    this.locked = false;
    this.pendingOnComplete = undefined;
    this.recordVelocity(actual);
    this.updateClassName();
  }

  // ---- public API ----

  scrollTo(target: ScrollToTarget, opts: ScrollToOptions = {}): void {
    if (this.killed) return;
    if ((this.stopped || this.locked) && !opts.force) return;

    const resolved = resolveScrollTarget(target, opts.offset ?? 0, {
      axis: this.axis,
      scroller: this.scroller,
      currentScroll: this.motion.value,
      limit: this.limit,
    });
    if (resolved === null) return;

    const clamped = clamp(0, this.limit, resolved);

    if (clamped === this.motion.target && !this.animating) {
      opts.onStart?.(this);
      opts.onComplete?.(this);
      return;
    }

    opts.onStart?.(this);

    if (opts.immediate) {
      this.motion.jump(clamped);
      this.animating = false;
      this.locked = false;
      this.pendingOnComplete = undefined;
      this.commitPosition(clamped);
      opts.onComplete?.(this);
      return;
    }

    this.pendingOnComplete = opts.onComplete;
    if (opts.lock) this.locked = true;
    this.retarget(clamped, this.resolveMotionVars(opts));
  }

  /** Freezes scrolling: wheel AND touch-drag input are swallowed (preventDefault, no movement) until start() - note this does NOT prevent dragging the native scrollbar thumb itself, which no JS API can intercept. Cancels any in-flight motion at its current position - matches how a modal opening should freeze the page exactly where it is, not finish animating first. */
  stop(): void {
    if (this.killed || this.stopped) return;
    this.stopped = true;
    this.locked = false;
    this.animating = false;
    this.pendingOnComplete = undefined;
    // Collapses motion.target back to wherever it actually froze - without this, a stale
    // pre-stop target would linger and the NEXT wheel delta after start() would clamp against
    // it (`motion.target + delta`), causing a sudden leap toward the old destination instead of
    // a small nudge from where the page visually is now.
    this.motion.jump(this.motion.value);
    this.updateClassName();
    this.emit("stop");
  }

  start(): void {
    if (this.killed || !this.stopped) return;
    this.stopped = false;
    this.updateClassName();
    this.emit("start");
  }

  on(event: SmoothScrollEvent, cb: (self: SmoothScroll) => void): this {
    (this.listeners[event] ??= new Set()).add(cb);
    return this;
  }

  off(event: SmoothScrollEvent, cb: (self: SmoothScroll) => void): this {
    this.listeners[event]?.delete(cb);
    return this;
  }

  private emit(event: SmoothScrollEvent): void {
    this.listeners[event]?.forEach((cb) => cb(this));
    if (event === "scroll") this.vars.onScroll?.(this);
    else if (event === "start") this.vars.onStart?.(this);
    else if (event === "stop") this.vars.onStop?.(this);
  }

  private updateClassName(): void {
    const root = (this.scroller === window ? document.documentElement : this.scroller) as HTMLElement;
    root.classList.toggle("six-smooth", !this.killed);
    root.classList.toggle("six-smooth-scrolling", this.animating);
    root.classList.toggle("six-smooth-stopped", this.stopped);
  }

  kill(): void {
    if (this.killed) return;
    this.killed = true;

    this.scroller.removeEventListener("wheel", this.boundWheel as EventListener);
    this.scroller.removeEventListener("touchmove", this.boundTouchMove as EventListener);
    this.scroller.removeEventListener("scroll", this.boundNativeScroll);
    removeResizeListener(this.boundWindowResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    ticker.remove(this.boundTick);

    this.updateClassName();
    this.listeners = {};
  }

  get scroll(): number {
    return this.motion.value;
  }

  get progress(): number {
    return this.limit === 0 ? 1 : clamp(0, 1, this.scroll / this.limit);
  }

  get velocity(): number {
    return this._velocity;
  }

  get direction(): 1 | -1 | 0 {
    return this._direction;
  }

  get isScrolling(): boolean {
    return this.animating;
  }

  get isStopped(): boolean {
    return this.stopped;
  }
}

export function smoothScroll(vars?: SmoothScrollVars): SmoothScroll {
  return new SmoothScroll(vars);
}
