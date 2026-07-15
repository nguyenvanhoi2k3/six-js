import { Animation } from "../core/animation";
import { addResizeListener, addScrollListener, getScroll, getViewportSize, removeResizeListener, removeScrollListener, Scroller } from "./observer";
import { createDirectScrub, createSmoothScrub, ScrubController } from "./scrub";
import { PinHandle, setupPin } from "./pin";
import { createMarkers, MarkerHandle } from "./markers";

export type PositionValue = string | number | (() => string | number);

export interface ScrollTriggerVars {
  trigger: Element | string;
  scroller?: Scroller | string;
  start?: PositionValue;
  end?: PositionValue;
  scrub?: boolean | number;
  pin?: boolean | Element | string;
  debug?: boolean;
  /** Prefixed onto the debug markers' "start"/"end" labels (`debug: true`) when multiple triggers are on screen at once - omitted (no prefix at all) when not given. */
  id?: string;
  animation?: Animation;
  onEnter?: (self: ScrollTrigger) => void;
  onLeave?: (self: ScrollTrigger) => void;
  onEnterBack?: (self: ScrollTrigger) => void;
  onLeaveBack?: (self: ScrollTrigger) => void;
  onUpdate?: (self: ScrollTrigger) => void;
  onRefresh?: (self: ScrollTrigger) => void;
}

interface EdgeSpec {
  ratio: number;
  offsetPx: number;
}

const EDGE_KEYWORDS: Record<string, number> = { top: 0, center: 0.5, bottom: 1 };

// Matches a trailing "+=N"/"-=N" pixel offset appended directly to an edge token, e.g.
// "top+=100" (100px past "top") or "30%-=20" (20px before the 30% mark) - GSAP's own compound
// edge syntax. Requires the literal "=" so a bare negative number like "-20" (its own valid
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
 * should be pinned to (`position: fixed`) so it represents a fixed point on screen, matching
 * GSAP's actual marker behavior, instead of scrolling with the document.
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

function resolveScroller(scroller: Scroller | string | undefined): Scroller {
  if (scroller === undefined) return window;
  if (typeof scroller === "string") {
    const el = document.querySelector(scroller);
    if (!el) {
      console.warn(`[six] ScrollTrigger: scroller "${scroller}" not found, falling back to window`);
      return window;
    }
    return el;
  }
  return scroller;
}

function resolveElement(value: Element | string): Element {
  if (typeof value === "string") {
    const el = document.querySelector(value);
    if (!el) throw new Error(`[six] ScrollTrigger: trigger "${value}" not found`);
    return el;
  }
  return value;
}

const instances: ScrollTrigger[] = [];

export class ScrollTrigger {
  readonly vars: ScrollTriggerVars;
  private triggerEl: Element;
  private scroller: Scroller;

  private startY = 0;
  private endY = 0;
  private wasInside = false;
  private lastScroll = 0;
  private killed = false;

  private pinHandle: PinHandle | null = null;
  private scrubController: ScrubController | null = null;
  private markerHandle: MarkerHandle | null = null;

  private readonly boundOnScroll = (): void => this.update();
  private readonly boundOnResize = (): void => this.refresh();

  constructor(vars: ScrollTriggerVars) {
    this.vars = vars;
    this.triggerEl = resolveElement(vars.trigger);
    this.scroller = resolveScroller(vars.scroller);

    if (vars.animation) {
      vars.animation.pause(); // driven entirely by scroll, not autoplay
      if (vars.scrub) {
        this.scrubController = typeof vars.scrub === "number" ? createSmoothScrub(vars.animation, vars.scrub) : createDirectScrub(vars.animation);
      }
    }

    if (vars.debug) this.markerHandle = createMarkers(vars.id ?? "");

    instances.push(this);

    this.refresh();

    addScrollListener(this.scroller, this.boundOnScroll);
    addResizeListener(this.boundOnResize);
  }

  private resolvePositionValue(value: PositionValue | undefined, fallback: string, relativeBase?: number): number {
    let resolved: PositionValue = value ?? fallback;
    if (typeof resolved === "function") resolved = resolved();
    if (typeof resolved === "number") return resolved;

    // A pure "+=N"/"-=N" string (no "<edge> <edge>" tokens) is relative to `relativeBase` - the
    // standard way to express a pin/scrub distance directly in pixels (e.g. end: "+=500"),
    // rather than as a trigger-edge-meets-viewport-edge position. Only meaningful for `end`
    // (called with relativeBase = the already-resolved startY) - `start` has no prior value to
    // be relative to, so this branch is simply skipped when relativeBase is undefined.
    const relMatch = resolved.trim().match(/^([+-])=(\d+(?:\.\d+)?)$/);
    if (relMatch && relativeBase !== undefined) {
      const offset = parseFloat(relMatch[2]);
      return relativeBase + (relMatch[1] === "-" ? -offset : offset);
    }

    const rect = this.triggerEl.getBoundingClientRect();
    const scrollY = getScroll(this.scroller, "y");
    const viewportSize = getViewportSize(this.scroller, "y");
    return resolvePositionString(resolved, rect, scrollY, viewportSize);
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

    return resolveViewportEdgeOffset(resolved, getViewportSize(this.scroller, "y"));
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
    const scrollY = getScroll(this.scroller, "y");
    return resolveTriggerEdgeY(resolved, rect, scrollY);
  }

  refresh(): void {
    if (this.killed) return;

    // revert any pin to its unpinned baseline before measuring, so a currently-pinned element's
    // transformed state doesn't corrupt this measurement.
    this.pinHandle?.setPhase("before");

    this.startY = this.resolvePositionValue(this.vars.start, "top bottom");
    this.endY = this.resolvePositionValue(this.vars.end, "bottom top", this.startY);
    if (this.endY <= this.startY) this.endY = this.startY + 1;

    if (this.vars.pin) {
      const pinTarget = this.vars.pin === true ? this.triggerEl : typeof this.vars.pin === "string" ? resolveElement(this.vars.pin) : this.vars.pin;

      if (!(pinTarget instanceof Element)) {
        console.warn(`[six] ScrollTrigger: pin must be true, a CSS selector, or an Element - got ${JSON.stringify(this.vars.pin)}, ignoring`);
      } else {
        this.pinHandle ??= setupPin(pinTarget as HTMLElement);
        // The element must stay exactly where it naturally sat in the viewport when the pin
        // starts (e.g. vertically centered for a "center center" trigger), not snap to the
        // viewport's top edge - naturalDocTop is where it'd be (in document coordinates) if it
        // were never pinned at all, so naturalDocTop - startY is its viewport-relative offset
        // at the moment scroll reaches startY.
        this.pinHandle.setPinnedTop(this.pinHandle.naturalDocTop - this.startY);
        this.pinHandle.setDistance(this.endY - this.startY);
      }
    }

    this.markerHandle?.update(
      this.resolveMarkerTriggerY(this.vars.start, "top bottom", this.startY),
      this.resolveMarkerTriggerY(this.vars.end, "bottom top", this.endY),
      this.resolveMarkerViewportY(this.vars.start, "top bottom"),
      this.resolveMarkerViewportY(this.vars.end, "bottom top"),
    );

    // Always an instant reposition, never animated - see the long comment on
    // ScrubController.snapTo() in scrub.ts for why this matters (page-reload rewind bug).
    this.update(true);
    this.vars.onRefresh?.(this);
  }

  private computeProgress(scrollY: number): number {
    return Math.max(0, Math.min((scrollY - this.startY) / (this.endY - this.startY), 1));
  }

  update(instant = false): void {
    if (this.killed) return;

    const scrollY = getScroll(this.scroller, "y");
    const progress = this.computeProgress(scrollY);
    const inside = scrollY >= this.startY && scrollY <= this.endY;
    const goingForward = scrollY >= this.lastScroll;
    const wasInside = this.wasInside;

    if (this.pinHandle) {
      this.pinHandle.setPhase(scrollY < this.startY ? "before" : scrollY > this.endY ? "after" : "during");
    }

    // Default toggle behavior (no scrub) matches GSAP's default `toggleActions: "play none none
    // none"` - only crossing the start going FORWARD plays the animation; entering backward,
    // leaving forward, and leaving backward do nothing to it by default (they still fire their
    // callbacks). This is deliberately NOT "play/reverse on every crossing" - that's a common
    // enough alternative that GSAP supports it via an explicit, configurable `toggleActions`
    // string, but it is not what happens when you don't specify one, and a scroll-reveal
    // animation that undoes itself every time the user scrolls back past the trigger is a
    // surprising, usually-unwanted default. Full `toggleActions` string support (independently
    // configuring all 4 crossings) is not implemented - documented Phase 1 scope cut.
    if (inside && !wasInside) {
      if (goingForward) {
        this.vars.onEnter?.(this);
        if (!this.scrubController) this.vars.animation?.play();
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

    if (instant) this.scrubController?.snapTo(progress);
    else this.scrubController?.update(progress);

    // progress is CLAMPED (constant) while outside the trigger's range, so a scroll happening
    // anywhere else on the page - not yet reached this trigger, or long past it - produces no
    // actual change for this instance. Only fire onUpdate while inside (progress genuinely
    // moving) or on the exact frame of entering/leaving (the transition itself is meaningful,
    // even though `inside` alone wouldn't catch the leaving case).
    if (inside || inside !== wasInside) this.vars.onUpdate?.(this);
  }

  progress(): number {
    return this.computeProgress(getScroll(this.scroller, "y"));
  }

  isActive(): boolean {
    return this.wasInside;
  }

  kill(): void {
    if (this.killed) return;
    this.killed = true;

    removeScrollListener(this.scroller, this.boundOnScroll);
    removeResizeListener(this.boundOnResize);
    this.pinHandle?.revert();
    this.scrubController?.kill();
    this.markerHandle?.remove();

    const idx = instances.indexOf(this);
    if (idx !== -1) instances.splice(idx, 1);
  }

  static create(vars: ScrollTriggerVars): ScrollTrigger {
    return new ScrollTrigger(vars);
  }

  static refresh(): void {
    for (const st of [...instances]) st.refresh();
  }

  static getAll(): readonly ScrollTrigger[] {
    return instances;
  }
}
