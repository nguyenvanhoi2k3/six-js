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
 * feeding them through this - multiplying by a timeScale of 0 would collapse totalTime to a
 * constant, wiping out the frozen position instead of preserving it.
 */
function toChildTotalTime(parentLocalTime: number, child: Animation): number {
  const ts = child.timeScale() as number;
  const tDur = child.totalDuration() as number;
  return (parentLocalTime - (child.startTime() as number)) * ts + (ts >= 0 ? 0 : tDur);
}

export class Timeline extends Animation implements AnimationParent, ListHandle<Animation> {
  private _firstChild: Animation | null = null;
  private _lastChild: Animation | null = null;
  private _cursor = 0;
  private _lastAdded: Animation | null = null;
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

    if (stagger === undefined) {
      this.add(new Tween(target, merged, mode, fromVars), position);
      return this;
    }

    const elements = resolveTargets(target);
    const start = this.resolvePosition(position);
    const baseDelay = merged.delay ?? 0;

    elements.forEach((el, index) => {
      const staggerDelay = computeStaggerDelay(index, elements.length, stagger);
      this.add(new Tween(el, { ...merged, delay: baseDelay + staggerDelay }, mode, fromVars), start);
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
    for (const child of forwards(this)) {
      if (child.paused()) continue; // frozen - leave its totalTime exactly as it was
      child.render(toChildTotalTime(localTime, child), suppressEvents, force);
    }
  }
}
