import { Animation, AnimationParent, AnimationVars } from "../core/animation";
import { forwards, insertSorted, ListHandle, removeNode } from "../core/linked-list";
import { PositionContext, resolvePosition as resolvePositionString, TimelinePosition } from "./position-parser";
import { computeStaggerDelay, StaggerInput } from "./stagger";
import { resolveTargets, Tween, TweenMode, TweenTarget, TweenVars } from "../tween/tween";

export type { TimelinePosition } from "./position-parser";

export interface TimelineVars extends AnimationVars {
  /**
   * "sequence" (default): a child added with no explicit position starts after the previously
   * added child ends - this is what makes `.to().to().to()` chain sequentially.
   * "now": a child added with no explicit position starts at the timeline's CURRENT playhead -
   * used only by the root timeline, so independent top-level animations all play concurrently
   * rather than queueing behind one another.
   */
  defaultPosition?: "sequence" | "now";
  /** If true, totalDuration is always Infinity so children are never clamped by the timeline's own span. Root timeline only. */
  unbounded?: boolean;
  /** Default vars merged (lowest precedence) into every `.to()/.from()/.fromTo()` added to this timeline. */
  defaults?: TweenVars;
}

export type TimelineTweenVars = TweenVars & { stagger?: StaggerInput };

/**
 * (parentLocalTime, child) -> child's own totalTime, expressed purely via Animation's public API
 * (no protected-field access needed). Callers must skip paused children entirely rather than
 * feeding them through this - multiplying by a speed of 0 would collapse totalTime to a
 * constant, wiping out the frozen position instead of preserving it.
 */
function toChildTotalTime(parentLocalTime: number, child: Animation): number {
  const ts = child.speed() as number;
  const tDur = child.totalDuration() as number;
  return (parentLocalTime - (child.startTime() as number)) * ts + (ts >= 0 ? 0 : tDur);
}

function currentLocalTimeOf(tl: Timeline): number {
  const parent = tl.parent;
  if (!(parent instanceof Timeline)) return tl.totalTime() as number;
  return toChildTotalTime(currentLocalTimeOf(parent), tl);
}

export class Timeline extends Animation implements AnimationParent, ListHandle<Animation> {
  private _firstChild: Animation | null = null;
  private _lastChild: Animation | null = null;
  private _cursor = 0;
  private _lastAdded: Animation | null = null;
  private _lastRenderedLocal = 0;
  private readonly _labels = new Map<string, number>();
  private readonly _defaultPositionMode: "sequence" | "now";
  private readonly _unbounded: boolean;
  private readonly _childDefaults: TweenVars;

  constructor(vars: TimelineVars = {}) {
    super(vars);
    this._defaultPositionMode = vars.defaultPosition ?? "sequence";
    this._unbounded = vars.unbounded ?? false;
    this._childDefaults = vars.defaults ?? {};
    if (this._unbounded) {
      this._dur = Infinity;
      this._tDur = Infinity;
      this._dirty = false;
    }
  }

  // ---- ListHandle<Animation> (backs the generic linked-list helpers) ----

  first(): Animation | null {
    return this._firstChild;
  }

  setFirst(node: Animation | null): void {
    this._firstChild = node;
  }

  last(): Animation | null {
    return this._lastChild;
  }

  setLast(node: Animation | null): void {
    this._lastChild = node;
  }

  // ---- children ----

  private defaultPosition(): number {
    return this._defaultPositionMode === "now" ? this._tTime : this._cursor;
  }

  private positionContext(): PositionContext {
    return {
      end: this.defaultPosition(),
      prevStart: this._lastAdded ? (this._lastAdded.startTime() as number) : 0,
      prevEnd: this._lastAdded ? this._lastAdded.endTime() : 0,
      getLabel: (name) => this._labels.get(name),
    };
  }

  resolvePosition(position?: TimelinePosition): number {
    return resolvePositionString(position, this.positionContext());
  }

  add(child: Animation, position?: TimelinePosition): this {
    child.parent?._removeChild(child);

    const start = this.resolvePosition(position);
    child.parent = this;
    child.startTime(start);
    insertSorted(this, child, (c) => c.startTime() as number);

    this._cursor = Math.max(this._cursor, start + (child.totalDuration() as number));
    this._lastAdded = child;
    // Widen the "already rendered" low-water mark back to this child's start, so the next
    // render's crossing-range check (see _renderIteration) is guaranteed to include it even if
    // it lands behind the timeline's current playhead.
    this._lastRenderedLocal = Math.min(this._lastRenderedLocal, start);
    this._uncache();
    return this;
  }

  remove(child: Animation): this {
    if (child.parent === this) {
      removeNode(this, child);
      child.parent = null;
      this._uncache();
    }
    return this;
  }

  _removeChild(child: Animation): void {
    this.remove(child);
  }

  /**
   * Re-anchors `child.startTime()` so that THIS timeline's current local time maps back to
   * exactly the totalTime the child was frozen at - see the long comment on
   * `AnimationParent._childResumed` for why this is needed at all.
   *
   * Skipped only if the timeline's playhead hasn't even reached the child's ORIGINALLY
   * scheduled start yet - that's a child still waiting its turn in a sequenced timeline (e.g.
   * paused immediately after `.add(child, 5)`, before the timeline has played anywhere near
   * position 5), which should keep waiting for that scheduled slot rather than being pulled
   * forward. Checking `child.totalTime() > 0` instead (whether it had "already progressed")
   * would get the single most common real-world case backwards: a `paused: true` tween
   * attached to the always-on root timeline (e.g. every OnScroll-driven animation, which
   * is created paused and `.play()`d later) has `_start` fixed at its creation moment and a
   * frozen totalTime of exactly 0 - by the time it's resumed, the root's playhead is already
   * long past that `_start`, so it unambiguously HAS "reached" it and must be repositioned to
   * begin now, even though it never progressed even slightly beforehand.
   */
  _childResumed(child: Animation): void {
    const now = currentLocalTimeOf(this);
    if (now < (child.startTime() as number)) return;

    const childTotalTime = child.totalTime() as number;
    const ts = child.speed() as number;
    const tDur = child.totalDuration() as number;
    const offset = ts >= 0 ? 0 : tDur;
    child.startTime(now - (childTotalTime - offset) / ts);
  }

  /** Cascades to every child before detaching itself from its own parent (if any). */
  kill(): this {
    for (const child of forwards(this)) {
      child.kill();
    }
    super.kill();
    return this;
  }

  getChildren(): Animation[] {
    return [...forwards(this)];
  }

  // ---- labels ----

  addLabel(name: string, position?: TimelinePosition): this {
    this._labels.set(name, this.resolvePosition(position));
    return this;
  }

  getLabelTime(name: string): number | undefined {
    return this._labels.get(name);
  }

  // ---- tween sugar ----

  private addTweens(target: TweenTarget, vars: TimelineTweenVars, mode: TweenMode, fromVars: Record<string, unknown> | undefined, position?: TimelinePosition): this {
    const { stagger, ...rest } = vars;
    const merged: TweenVars = { ...this._childDefaults, ...rest };

    // Resolve the position BEFORE constructing anything, so a child scheduled anywhere other
    // than this timeline's actual current moment is built with renderInitial=false - see the
    // long comment on Tween's constructor for why a premature self-render at a non-"now"
    // position corrupts shared per-element state instead of just being a harmless no-op.
    const start = this.resolvePosition(position);
    const renderInitial = Math.abs(start - currentLocalTimeOf(this)) < 1e-9;

    if (stagger === undefined) {
      this.add(new Tween(target, merged, mode, fromVars, renderInitial), start);
      return this;
    }

    const elements = resolveTargets(target);
    const baseDelay = merged.delay ?? 0;

    elements.forEach((el, index) => {
      const staggerDelay = computeStaggerDelay(index, elements.length, stagger);
      this.add(new Tween(el, { ...merged, delay: baseDelay + staggerDelay }, mode, fromVars, renderInitial), start);
    });

    return this;
  }

  to(target: TweenTarget, vars: TimelineTweenVars, position?: TimelinePosition): this {
    return this.addTweens(target, vars, "to", undefined, position);
  }

  from(target: TweenTarget, vars: TimelineTweenVars, position?: TimelinePosition): this {
    return this.addTweens(target, vars, "from", undefined, position);
  }

  fromTo(target: TweenTarget, fromVars: Record<string, unknown>, toVars: TimelineTweenVars, position?: TimelinePosition): this {
    return this.addTweens(target, toVars, "fromTo", fromVars, position);
  }

  set(target: TweenTarget, vars: Record<string, unknown>, position?: TimelinePosition): this {
    return this.addTweens(target, { ...vars, duration: 0 }, "to", undefined, position);
  }

  call(fn: () => void, position?: TimelinePosition): this {
    this.add(new Tween(null, { duration: 0, onStart: fn }), position);
    return this;
  }

  // ---- duration ----

  protected _recomputeTotalDuration(): void {
    if (this._unbounded) {
      this._dur = Infinity;
      this._tDur = Infinity;
      this._dirty = false;
      return;
    }

    let maxEnd = 0;
    for (const child of forwards(this)) {
      const end = child.endTime();
      if (end > maxEnd) maxEnd = end;
    }
    this._dur = maxEnd;

    super._recomputeTotalDuration();
  }

  // ---- rendering ----

  protected _renderIteration(localTime: number, _reversed: boolean, _iteration: number, suppressEvents: boolean, force: boolean): void {
    // Only touch children whose own [start, end] overlaps the span just crossed (lastLocal..
    // localTime, in either direction - covers both a normal small per-frame step AND a big
    // direct seek in one call). This matters whenever two children share a render target with
    // DIFFERENT values (e.g. chained keyframe segments, or two `.to()` calls on the same
    // property at different positions): rendering every child unconditionally every frame would
    // let an untouched, still-in-the-future child's own clamped-to-its-start write stomp an
    // active child's just-computed value, since both target the same DOM property and the
    // future child simply happens to iterate later in start-time order.
    const lo = Math.min(this._lastRenderedLocal, localTime);
    const hi = Math.max(this._lastRenderedLocal, localTime);
    this._lastRenderedLocal = localTime;

    for (const child of forwards(this)) {
      if (child.paused()) continue; // frozen - leave its totalTime exactly as it was

      const start = child.startTime() as number;
      const end = child.endTime();
      if (end < lo || start > hi) continue; // fully outside the range this render pass covers
      if ((child.totalDuration() as number) === 0 && start <= lo) continue;

      child.render(toChildTotalTime(localTime, child), suppressEvents, force);
    }
  }
}
