export type Scroller = Window | Element;
export type Axis = "y" | "x";
export type Listener = () => void;

/**
 * Generic scroll/resize listening + a memoized-read layer, decoupled from OnScroll's own
 * position-parsing/sticky/sync concerns. Has zero dependency on on-scroll.ts - deliberately
 * one-directional.
 */

// Bumped on every scroll/resize/manual invalidate - callers use this to avoid re-reading
// layout-forcing values (scrollTop, clientHeight, ...) more than once per "generation" no
// matter how many OnScroll instances ask for them in the same tick.
let generation = 0;

export function currentGeneration(): number {
  return generation;
}

export function invalidateReads(): void {
  generation++;
}

interface CachedRead {
  gen: number;
  value: number;
}

const scrollCache: Record<Axis, WeakMap<Scroller, CachedRead>> = { y: new WeakMap(), x: new WeakMap() };

function readScrollRaw(scroller: Scroller, axis: Axis): number {
  if (scroller === window) return axis === "y" ? window.scrollY : window.scrollX;
  const el = scroller as Element;
  return axis === "y" ? el.scrollTop : el.scrollLeft;
}

export function getScroll(scroller: Scroller, axis: Axis = "y"): number {
  const cache = scrollCache[axis];
  const cached = cache.get(scroller);
  if (cached && cached.gen === generation) return cached.value;

  const value = readScrollRaw(scroller, axis);
  cache.set(scroller, { gen: generation, value });
  return value;
}

export function setScroll(scroller: Scroller, axis: Axis, value: number): void {
  if (scroller === window) {
    if (axis === "y") window.scrollTo(window.scrollX, value);
    else window.scrollTo(value, window.scrollY);
  } else {
    const el = scroller as Element;
    if (axis === "y") el.scrollTop = value;
    else el.scrollLeft = value;
  }
  invalidateReads();
}

export function getViewportSize(scroller: Scroller, axis: Axis = "y"): number {
  if (scroller === window) {
    return axis === "y" ? (window.visualViewport?.height ?? window.innerHeight) : (window.visualViewport?.width ?? window.innerWidth);
  }
  const el = scroller as HTMLElement;
  return axis === "y" ? el.clientHeight : el.clientWidth;
}

export function getMaxScroll(scroller: Scroller, axis: Axis = "y"): number {
  if (scroller === window) {
    const doc = document.documentElement;
    return axis === "y" ? doc.scrollHeight - getViewportSize(scroller, "y") : doc.scrollWidth - getViewportSize(scroller, "x");
  }
  const el = scroller as HTMLElement;
  return axis === "y" ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
}

const scrollListeners = new Map<Scroller, Set<Listener>>();
const nativeScrollHandlers = new Map<Scroller, () => void>();

export function addScrollListener(scroller: Scroller, listener: Listener): void {
  let set = scrollListeners.get(scroller);
  if (!set) {
    set = new Set();
    scrollListeners.set(scroller, set);

    const handler = (): void => {
      invalidateReads();
      set!.forEach((l) => l());
    };
    nativeScrollHandlers.set(scroller, handler);
    scroller.addEventListener("scroll", handler, { passive: true });
  }
  set.add(listener);
}

export function removeScrollListener(scroller: Scroller, listener: Listener): void {
  const set = scrollListeners.get(scroller);
  if (!set) return;

  set.delete(listener);
  if (set.size === 0) {
    const handler = nativeScrollHandlers.get(scroller);
    if (handler) scroller.removeEventListener("scroll", handler);
    nativeScrollHandlers.delete(scroller);
    scrollListeners.delete(scroller);
  }
}

const resizeListeners = new Set<Listener>();
let resizeAttached = false;

function handleResize(): void {
  invalidateReads();
  resizeListeners.forEach((l) => l());
}

export function addResizeListener(listener: Listener): void {
  resizeListeners.add(listener);
  if (!resizeAttached && typeof window !== "undefined") {
    resizeAttached = true;
    window.addEventListener("resize", handleResize);
    // An OnScroll's first refresh() (during construction) can run before images/fonts below
    // the trigger finish loading, measuring against a document that's still going to grow -
    // positions computed from that measurement end up wrong once the remaining content loads in.
    // Re-run once load fires (skipped if it already has - a late listener on an already-fired
    // one-time event never runs).
    if (typeof document !== "undefined" && document.readyState !== "complete") {
      window.addEventListener("load", handleResize, { once: true });
    }
  }
}

export function removeResizeListener(listener: Listener): void {
  resizeListeners.delete(listener);
}
