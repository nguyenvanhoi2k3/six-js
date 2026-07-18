import { Animation } from "../../core/animation";
import { addResizeListener, addScrollListener, getScroll, getViewportSize, removeResizeListener, removeScrollListener, resolveScroller, Scroller } from "./observer";
import { createDirectSync, createSmoothSync, SyncController } from "./sync";
import { StickyHandle, setupSticky } from "./sticky";
import { createMarkers, MarkerHandle } from "./markers";

export type PositionValue = string | number | (() => string | number);

export interface OnScrollVars {
  trigger: Element | string;
  scroller?: Scroller | string;
  start?: PositionValue;
  end?: PositionValue;
  sync?: boolean | number;
  sticky?: boolean | Element | string;
  /** Which axis to measure/compare positions along - "y" (default) or "x" (for a horizontally-scrolled track). */
  axis?: "x" | "y";
  syncTo?: Animation;
  debug?: boolean;
  /** Prefixed onto the debug markers' "start"/"end" labels (`debug: true`) when multiple triggers are on screen at once - omitted (no prefix at all) when not given. */
  id?: string;
  animation?: Animation;
  onEnter?: (self: OnScroll) => void;
  onLeave?: (self: OnScroll) => void;
  onEnterBack?: (self: OnScroll) => void;
  onLeaveBack?: (self: OnScroll) => void;
  onUpdate?: (self: OnScroll) => void;
  onRefresh?: (self: OnScroll) => void;
}

interface EdgeSpec {
  ratio: number;
  offsetPx: number;
}

const EDGE_KEYWORDS: Record<string, number> = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 };

// Matches a trailing "+=N"/"-=N" pixel offset appended directly to an edge token, e.g.
// "top+=100" (100px past "top") or "30%-=20" (20px before the 30% mark) - a compound edge
// syntax. Requires the literal "=" so a bare negative number like "-20" (its own valid
// token, meaning "20px from top") isn't mistaken for a suffix.
const EDGE_OFFSET_RE = /^(.*?)([+-]=[\d.]+)$/;

export function parseEdge(token: string): EdgeSpec {
  const t = token.trim();
  const match = t.match(EDGE_OFFSET_RE);
  const base = match ? match[1] : t;
  const extraOffset = match ? (match[2][0] === "-" ? -1 : 1) * parseFloat(match[2].slice(2)) : 0;

  if (base in EDGE_KEYWORDS) return { ratio: EDGE_KEYWORDS[base], offsetPx: extraOffset };
  if (base.endsWith("%")) return { ratio: parseFloat(base) / 100, offsetPx: extraOffset };
  const px = parseFloat(base);
  return { ratio: 0, offsetPx: (isNaN(px) ? 0 : px) + extraOffset };
}

/** "<triggerEdge> <viewportEdge>" -> absolute document-Y scroll position where they align. */
export function resolvePositionString(str: string, triggerRect: { top: number; height: number }, scrollY: number, viewportSize: number): number {
  const [triggerToken = "top", viewportToken = "top"] = str.trim().split(/\s+/);
  const triggerEdge = parseEdge(triggerToken);
  const viewportEdge = parseEdge(viewportToken);

  const triggerPointAbs = scrollY + triggerRect.top + triggerEdge.ratio * triggerRect.height + triggerEdge.offsetPx;
  const viewportOffset = viewportEdge.ratio * viewportSize + viewportEdge.offsetPx;

  return triggerPointAbs - viewportOffset;
}

/**
 * Extracts just the "<viewportEdge>" half of a "<triggerEdge> <viewportEdge>" position string, as
 * a pixel offset from the top of the viewport. Unlike the full resolved scrollY (which depends on
 * scroll position), this is constant for a given viewportSize - it's what a debug marker line
 * should be pinned to (`position: fixed`) so it represents a fixed point on screen, instead of
 * scrolling with the document.
 */
export function resolveViewportEdgeOffset(str: string, viewportSize: number): number {
  const [, viewportToken = "top"] = str.trim().split(/\s+/);
  const viewportEdge = parseEdge(viewportToken);
  return viewportEdge.ratio * viewportSize + viewportEdge.offsetPx;
}

/**
 * Extracts just the "<triggerEdge>" half of a "<triggerEdge> <viewportEdge>" position string,
 * resolved to an absolute document-Y coordinate - the physical point on the trigger element
 * itself (its own top + ratio*height + offsetPx), independent of viewport size. This is what a
 * debug marker's document-anchored "trigger" line should track: unlike `resolvePositionString`'s
 * result (a scroll-position threshold, which shifts if the viewport is resized even though the
 * trigger element hasn't moved), this value only changes if the trigger element itself moves.
 */
export function resolveTriggerEdgeY(str: string, triggerRect: { top: number; height: number }, scrollY: number): number {
  const [triggerToken = "top"] = str.trim().split(/\s+/);
  const triggerEdge = parseEdge(triggerToken);
  return scrollY + triggerRect.top + triggerEdge.ratio * triggerRect.height + triggerEdge.offsetPx;
}

function resolveElement(value: Element | string): Element {
  if (typeof value === "string") {
    const el = document.querySelector(value);
    if (!el) throw new Error(`[six-js] OnScroll: trigger "${value}" not found`);
    return el;
  }
  return value;
}

const instances: OnScroll[] = [];

export class OnScroll {
  readonly vars: OnScrollVars;
  private triggerEl: Element;
  private scroller: Scroller;

  private startY = 0;
  private endY = 0;
  private wasInside = false;
  private lastScroll = 0;
  private killed = false;
  private hasHeardSyncSource = false;

  private syncSourceRect0: { top: number; height: number } = { top: 0, height: 0 };
  private syncSourceRect1: { top: number; height: number } = { top: 0, height: 0 };

  private stickyHandle: StickyHandle | null = null;
  private syncController: SyncController | null = null;
  private markerHandle: MarkerHandle | null = null;

  private readonly boundOnScroll = (): void => this.update();
  private readonly boundOnResize = (): void => this.refresh();
  // The sync source's own progress can still be catching up from a stale pre-restoration reading
  // (see the reload-race comment on createSmoothSync in sync.ts) when this child's own
  // construction-time refresh() ran, so its own first-ever observation of the sync source may
  // already be wrong. Treat the first "update" ever heard FROM the sync source as a recalculation
  // too (instant), not a live crossing - see the `instant` branch in update() below.
  private readonly boundOnSyncSourceUpdate = (): void => {
    const firstSyncSourceUpdate = !this.hasHeardSyncSource;
    this.hasHeardSyncSource = true;
    this.update(firstSyncSourceUpdate);
  };

  constructor(vars: OnScrollVars) {
    this.vars = vars;
    this.triggerEl = resolveElement(vars.trigger);
    this.scroller = resolveScroller(vars.scroller);

    if (vars.animation) {
      vars.animation.pause(); // driven entirely by scroll, not autoplay
      if (vars.sync) {
        this.syncController = typeof vars.sync === "number" ? createSmoothSync(vars.animation, vars.sync) : createDirectSync(vars.animation);
      }
    }

    if (vars.debug && !vars.syncTo) this.markerHandle = createMarkers(vars.id ?? "");

    instances.push(this);

    this.refresh();

    if (vars.syncTo) vars.syncTo.on("update", this.boundOnSyncSourceUpdate);
    else addScrollListener(this.scroller, this.boundOnScroll);
    addResizeListener(this.boundOnResize);
  }

  private resolvedAxis(): "x" | "y" {
    return this.vars.axis ?? "y";
  }

  private axisRect(rect: DOMRect): { top: number; height: number } {
    return this.resolvedAxis() === "x" ? { top: rect.left, height: rect.width } : { top: rect.top, height: rect.height };
  }

  /**
   * Viewport-relative offset of the scroller's own edge along the active axis - 0 for `window`,
   * otherwise a nested scroller Element's own on-screen position. `getScroll()` for an Element
   * scroller reads its local `scrollTop`/`scrollLeft` (a small range starting at 0, unrelated to
   * where the container sits on the page), while `triggerEl.getBoundingClientRect()` is always
   * viewport-relative (i.e. it bakes in the container's own page offset). Combining those two
   * directly - as `resolvePositionValue` needs to, the same way it safely does for `window` where
   * both quantities already share one coordinate space - would put the trigger's position on a
   * different numeric scale than the scroller's live scroll value, so thresholds like `startY`
   * could end up outside any value the scroller can ever reach. Subtracting this offset first
   * re-bases the trigger's rect onto the scroller's own client box, mirroring how `rect.top` is
   * already naturally viewport(=scroller)-relative in the `window` case.
   */
  private scrollerEdgeOffset(): number {
    if (this.scroller === window) return 0;
    return this.axisRect((this.scroller as Element).getBoundingClientRect()).top;
  }

  private measureSyncSourceEdges(): void {
    const anim = this.vars.syncTo!;
    const savedTime = anim.totalTime() as number;
    const dur = anim.totalDuration() as number;

    anim.seek(0);
    this.syncSourceRect0 = this.axisRect(this.triggerEl.getBoundingClientRect());
    anim.seek(dur);
    this.syncSourceRect1 = this.axisRect(this.triggerEl.getBoundingClientRect());
    anim.seek(savedTime);
  }

  private resolveSyncSourcePosition(value: PositionValue | undefined, fallback: string, relativeBase?: number): number {
    let resolved: PositionValue = value ?? fallback;
    if (typeof resolved === "function") resolved = resolved();
    if (typeof resolved === "number") return resolved;

    const relMatch = resolved.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (relMatch && relativeBase !== undefined) {
      const offsetPx = parseFloat(relMatch[2]) * (relMatch[1] === "-" ? -1 : 1);
      const span = Math.abs(this.syncSourceRect1.top - this.syncSourceRect0.top);
      return relativeBase + (span !== 0 ? offsetPx / span : 0);
    }

    const [triggerToken = "top", viewportToken = "top"] = resolved.trim().split(/\s+/);
    const triggerEdge = parseEdge(triggerToken);
    const viewportEdge = parseEdge(viewportToken);

    const edge0 = this.syncSourceRect0.top + triggerEdge.ratio * this.syncSourceRect0.height + triggerEdge.offsetPx;
    const edge1 = this.syncSourceRect1.top + triggerEdge.ratio * this.syncSourceRect1.height + triggerEdge.offsetPx;
    const span = edge1 - edge0;

    const viewportSize = getViewportSize(this.scroller, this.resolvedAxis());
    const viewportThreshold = viewportEdge.ratio * viewportSize + viewportEdge.offsetPx;

    return span !== 0 ? (viewportThreshold - edge0) / span : 0;
  }

  private resolvePositionValue(value: PositionValue | undefined, fallback: string, relativeBase?: number): number {
    let resolved: PositionValue = value ?? fallback;
    if (typeof resolved === "function") resolved = resolved();
    if (typeof resolved === "number") return resolved;

    // A pure "+=N"/"-=N" string (no "<edge> <edge>" tokens) is relative to `relativeBase` - the
    // standard way to express a sticky/sync distance directly in pixels (e.g. end: "+=500"),
    // rather than as a trigger-edge-meets-viewport-edge position. Only meaningful for `end`
    // (called with relativeBase = the already-resolved startY) - `start` has no prior value to
    // be relative to, so this branch is simply skipped when relativeBase is undefined.
    const relMatch = resolved.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (relMatch && relativeBase !== undefined) {
      const offset = parseFloat(relMatch[2]);
      return relativeBase + (relMatch[1] === "-" ? -offset : offset);
    }

    const rect = this.axisRect(this.triggerEl.getBoundingClientRect());
    const scrollY = getScroll(this.scroller, this.resolvedAxis());
    const viewportSize = getViewportSize(this.scroller, this.resolvedAxis());
    const relativeRect = { top: rect.top - this.scrollerEdgeOffset(), height: rect.height };
    return resolvePositionString(resolved, relativeRect, scrollY, viewportSize);
  }

  /** Viewport-relative pixel offset (from the top of the viewport) that a debug marker line for
   * this start/end value should sit at - always the "<viewportEdge>" component of a position
   * string. A plain number/function-returning-number, or a *whole-string* relative "+=N" (no
   * second token at all, e.g. `end: "+=500"`), carries no edge info, so it defaults to the top of
   * the viewport (ratio 0). A compound token like `"+=100 bottom"` still has a real viewport edge
   * ("bottom") as its second token, so it must NOT hit this early return - only a prefix check
   * (no `$` anchor) would wrongly swallow that second token too. */
  private resolveMarkerViewportY(value: PositionValue | undefined, fallback: string): number {
    let resolved: PositionValue = value ?? fallback;
    if (typeof resolved === "function") resolved = resolved();
    if (typeof resolved !== "string" || /^[+-]=\d+(?:\.\d+)?$/.test(resolved.trim())) return 0;

    return resolveViewportEdgeOffset(resolved, getViewportSize(this.scroller, this.resolvedAxis()));
  }

  /** Absolute document-Y that a debug marker's "trigger" line (left-aligned, follows the page)
   * should sit at - always the "<triggerEdge>" component of a position string, resolved against
   * the trigger element's own current position. Falls back to `computedY` (the already-resolved
   * scrollY-threshold, i.e. `this.startY`/`this.endY`) for a plain number/function or a
   * whole-string relative "+=N", which carry no independent trigger-edge token to resolve. */
  private resolveMarkerTriggerY(value: PositionValue | undefined, fallback: string, computedY: number): number {
    let resolved: PositionValue = value ?? fallback;
    if (typeof resolved === "function") resolved = resolved();
    if (typeof resolved !== "string" || /^[+-]=\d+(?:\.\d+)?$/.test(resolved.trim())) return computedY;

    const rect = this.triggerEl.getBoundingClientRect();
    const scrollY = getScroll(this.scroller, this.resolvedAxis());
    return resolveTriggerEdgeY(resolved, this.axisRect(rect), scrollY);
  }

  refresh(): void {
    if (this.killed) return;

    // revert any sticking to its unstuck baseline before measuring, so a currently-stuck
    // element's transformed state doesn't corrupt this measurement.
    this.stickyHandle?.setPhase("before");

    if (this.vars.syncTo) {
      this.measureSyncSourceEdges();
      this.startY = this.resolveSyncSourcePosition(this.vars.start, "top bottom");
      this.endY = this.resolveSyncSourcePosition(this.vars.end, "bottom top", this.startY);
      if (this.endY <= this.startY) this.endY = this.startY + 0.0001;
    } else {
      this.startY = this.resolvePositionValue(this.vars.start, "top bottom");
      this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY);
      if (this.endY <= this.startY) this.endY = this.startY + 1;
    }

    if (this.vars.sticky) {
      const stickyTarget = this.vars.sticky === true ? this.triggerEl : typeof this.vars.sticky === "string" ? resolveElement(this.vars.sticky) : this.vars.sticky;

      if (!(stickyTarget instanceof Element)) {
        console.warn("[six-js] OnScroll: invalid `sticky` value, ignoring");
      } else {
        this.stickyHandle ??= setupSticky(stickyTarget as HTMLElement);
        // The element must stay exactly where it naturally sat in the viewport when it starts
        // sticking (e.g. vertically centered for a "center center" trigger), not snap to the
        // viewport's top edge - naturalDocTop is where it'd be (in document coordinates) if it
        // were never stuck at all, so naturalDocTop - startY is its viewport-relative offset at
        // the moment scroll reaches startY.
        this.stickyHandle.setStickyTop(this.stickyHandle.naturalDocTop - this.startY);
        this.stickyHandle.setDistance(this.endY - this.startY);
      }
    }

    if (!this.vars.syncTo) {
      this.markerHandle?.update(
        this.resolveMarkerTriggerY(this.vars.start, "top bottom", this.startY),
        this.resolveMarkerTriggerY(this.vars.end, "bottom top", this.endY),
        this.resolveMarkerViewportY(this.vars.start, "top bottom"),
        this.resolveMarkerViewportY(this.vars.end, "bottom top"),
      );
    }

    // Always an instant reposition, never animated - see the long comment on
    // SyncController.snapTo() in sync.ts for why this matters (page-reload rewind bug).
    this.update(true);
    this.vars.onRefresh?.(this);
  }

  private computeProgress(scrollY: number): number {
    return Math.max(0, Math.min((scrollY - this.startY) / (this.endY - this.startY), 1));
  }

  private currentPosition(): number {
    return this.vars.syncTo ? (this.vars.syncTo.totalProgress() as number) : getScroll(this.scroller, this.resolvedAxis());
  }

  update(instant = false): void {
    if (this.killed) return;

    const scrollY = this.currentPosition();
    const progress = this.computeProgress(scrollY);
    const inside = scrollY >= this.startY && scrollY <= this.endY;
    const goingForward = scrollY >= this.lastScroll;
    const wasInside = this.wasInside;

    if (this.stickyHandle) {
      this.stickyHandle.setPhase(scrollY < this.startY ? "before" : scrollY > this.endY ? "after" : "during");
    }

    // Default toggle behavior (no sync): only crossing the start going FORWARD plays the
    // animation; entering backward, leaving forward, and leaving backward do nothing to it by
    // default (they still fire their callbacks). This is deliberately NOT "play/reverse on every
    // crossing" - that's a common enough alternative, but it is not what happens when you don't
    // configure one, and a scroll-reveal animation that undoes itself every time the user scrolls
    // back past the trigger is a surprising, usually-unwanted default. Independently configuring
    // all 4 crossings is not implemented - documented Phase 1 scope cut.
    //
    // `instant` (not merely "the very first update ever") gates the jump-to-complete branch,
    // matching this file's own "a recalculation always repositions synchronously and never
    // animates as a side effect" rule everywhere else, not just once at construction - a LATER
    // recalculation (window resize, an explicit OnScroll.refresh(), or - for a `syncTo` child -
    // the sync source's own first post-construction "update", which may
    // itself be correcting a stale reading from before, see boundOnSyncSourceUpdate above)
    // discovering "already past and never yet entered" should also snap, not visibly replay.
    if (instant && !this.syncController && !wasInside && scrollY >= this.startY) {
      this.vars.onEnter?.(this);
      this.vars.animation?.totalProgress(1);
    } else if (inside && !wasInside) {
      if (goingForward) {
        this.vars.onEnter?.(this);
        if (!this.syncController) this.vars.animation?.play();
      } else {
        this.vars.onEnterBack?.(this);
      }
    } else if (!inside && wasInside) {
      if (goingForward) {
        this.vars.onLeave?.(this);
      } else {
        this.vars.onLeaveBack?.(this);
      }
    }

    this.wasInside = inside;
    this.lastScroll = scrollY;

    if (instant) this.syncController?.snapTo(progress);
    else this.syncController?.update(progress);

    // progress is CLAMPED (constant) while outside the trigger's range, so a scroll happening
    // anywhere else on the page - not yet reached this trigger, or long past it - produces no
    // actual change for this instance. Only fire onUpdate while inside (progress genuinely
    // moving) or on the exact frame of entering/leaving (the transition itself is meaningful,
    // even though `inside` alone wouldn't catch the leaving case).
    if (inside || inside !== wasInside) this.vars.onUpdate?.(this);
  }

  progress(): number {
    return this.computeProgress(this.currentPosition());
  }

  isActive(): boolean {
    return this.wasInside;
  }

  kill(): void {
    if (this.killed) return;
    this.killed = true;

    if (this.vars.syncTo) this.vars.syncTo.off("update", this.boundOnSyncSourceUpdate);
    else removeScrollListener(this.scroller, this.boundOnScroll);
    removeResizeListener(this.boundOnResize);
    this.stickyHandle?.revert();
    this.syncController?.kill();
    this.markerHandle?.remove();

    const idx = instances.indexOf(this);
    if (idx !== -1) instances.splice(idx, 1);
  }

  static create(vars: OnScrollVars): OnScroll {
    return new OnScroll(vars);
  }

  static refresh(): void {
    for (const st of [...instances]) st.refresh();
  }

  static getAll(): readonly OnScroll[] {
    return instances;
  }
}
