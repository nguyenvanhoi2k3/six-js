import { Animation, AnimationParent, AnimationVars } from "../core/animation";
import { forwards, insertSorted, ListHandle, removeNode } from "../core/linked-list";

export type TimelinePosition = number;

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
}

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
  private readonly _defaultPositionMode: "sequence" | "now";
  private readonly _unbounded: boolean;

  constructor(vars: TimelineVars = {}) {
    super(vars);
    this._defaultPositionMode = vars.defaultPosition ?? "sequence";
    this._unbounded = vars.unbounded ?? false;
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

  resolvePosition(position?: TimelinePosition): number {
    if (position === undefined) return this.defaultPosition();
    return Math.max(0, position);
  }

  add(child: Animation, position?: TimelinePosition): this {
    child.parent?._removeChild(child);

    const start = this.resolvePosition(position);
    child.parent = this;
    child.startTime(start);
    insertSorted(this, child, (c) => c.startTime() as number);

    this._cursor = Math.max(this._cursor, start + (child.totalDuration() as number));
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
