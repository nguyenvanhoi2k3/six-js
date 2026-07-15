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
  markers?: boolean;
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

export function parseEdge(token: string): EdgeSpec {
  const t = token.trim();
  if (t in EDGE_KEYWORDS) return { ratio: EDGE_KEYWORDS[t], offsetPx: 0 };
  if (t.endsWith("%")) return { ratio: parseFloat(t) / 100, offsetPx: 0 };
  const px = parseFloat(t);
  return { ratio: 0, offsetPx: isNaN(px) ? 0 : px };
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

    if (vars.markers) this.markerHandle = createMarkers(String(instances.length));

    instances.push(this);

    this.refresh();

    addScrollListener(this.scroller, this.boundOnScroll);
    addResizeListener(this.boundOnResize);
  }

  private resolvePositionValue(value: PositionValue | undefined, fallback: string): number {
    let resolved: PositionValue = value ?? fallback;
    if (typeof resolved === "function") resolved = resolved();
    if (typeof resolved === "number") return resolved;

    const rect = this.triggerEl.getBoundingClientRect();
    const scrollY = getScroll(this.scroller, "y");
    const viewportSize = getViewportSize(this.scroller, "y");
    return resolvePositionString(resolved, rect, scrollY, viewportSize);
  }

  refresh(): void {
    if (this.killed) return;

    // revert any pin to its unpinned baseline before measuring, so a currently-pinned element's
    // transformed state doesn't corrupt this measurement.
    this.pinHandle?.setPhase("before");

    this.startY = this.resolvePositionValue(this.vars.start, "top bottom");
    this.endY = this.resolvePositionValue(this.vars.end, "bottom top");
    if (this.endY <= this.startY) this.endY = this.startY + 1;

    if (this.vars.pin) {
      const pinTarget = this.vars.pin === true ? this.triggerEl : typeof this.vars.pin === "string" ? resolveElement(this.vars.pin) : this.vars.pin;
      this.pinHandle ??= setupPin(pinTarget as HTMLElement);
      this.pinHandle.setDistance(this.endY - this.startY);
    }

    this.markerHandle?.update(this.startY, this.endY);

    this.update();
    this.vars.onRefresh?.(this);
  }

  private computeProgress(scrollY: number): number {
    return Math.max(0, Math.min((scrollY - this.startY) / (this.endY - this.startY), 1));
  }

  update(): void {
    if (this.killed) return;

    const scrollY = getScroll(this.scroller, "y");
    const progress = this.computeProgress(scrollY);
    const inside = scrollY >= this.startY && scrollY <= this.endY;
    const goingForward = scrollY >= this.lastScroll;

    if (this.pinHandle) {
      this.pinHandle.setPhase(scrollY < this.startY ? "before" : scrollY > this.endY ? "after" : "during");
    }

    if (inside && !this.wasInside) {
      if (goingForward) this.vars.onEnter?.(this);
      else this.vars.onEnterBack?.(this);
      if (!this.scrubController) this.vars.animation?.play();
    } else if (!inside && this.wasInside) {
      if (goingForward) this.vars.onLeave?.(this);
      else {
        this.vars.onLeaveBack?.(this);
        if (!this.scrubController) this.vars.animation?.reverse();
      }
    }

    this.wasInside = inside;
    this.lastScroll = scrollY;

    this.scrubController?.update(progress);

    this.vars.onUpdate?.(this);
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
