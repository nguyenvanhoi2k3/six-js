export type StickyPhase = "before" | "during" | "after";

export interface StickyHandle {
  /** The stuck element's natural (unstuck) document-absolute top - callers use this to compute the correct fixed-position offset (see setStickyTop). */
  readonly naturalDocTop: number;
  /** Reserves scroll distance in the spacer for the stuck duration (on top of the element's own natural size). */
  setDistance(distancePx: number): void;
  /** The viewport-relative `top` to use while stuck (`position: fixed`) - NOT always 0. For a trigger stuck via e.g. "center center", the element must stay wherever it naturally sat in the viewport when it started sticking, not snap to the top edge. */
  setStickyTop(topPx: number): void;
  setPhase(phase: StickyPhase): void;
  revert(): void;
}

interface StickyCacheEntry {
  spacer: HTMLElement;
  refCount: number;
  rect: DOMRect;
  /** rect.top + the scroll position at setup time - the element's natural top in DOCUMENT (not viewport) coordinates. */
  docTop: number;
  distance: number;
  originalStyles: { position: string; top: string; left: string; width: string; margin: string; transform: string };
}

// Cached per sticky element (not per OnScroll) - multiple triggers sticking the same element
// share one spacer, reference-counted: we don't want N spacers for one element just because N
// OnScroll triggers happen to target it.
const stickyCache = new WeakMap<HTMLElement, StickyCacheEntry>();

export function setupSticky(stickyEl: HTMLElement): StickyHandle {
  let entry = stickyCache.get(stickyEl);

  if (!entry) {
    const rect = stickyEl.getBoundingClientRect();
    const computed = getComputedStyle(stickyEl);

    const spacer = document.createElement("div");
    spacer.style.position = "relative";
    spacer.style.width = `${rect.width}px`;
    spacer.style.height = `${rect.height}px`;

    stickyEl.parentNode!.insertBefore(spacer, stickyEl);
    spacer.appendChild(stickyEl);

    entry = {
      spacer,
      refCount: 0,
      rect,
      docTop: rect.top + window.scrollY,
      distance: 0,
      originalStyles: {
        position: stickyEl.style.position,
        top: stickyEl.style.top,
        left: stickyEl.style.left,
        width: stickyEl.style.width,
        margin: computed.margin,
        transform: stickyEl.style.transform,
      },
    };
    stickyCache.set(stickyEl, entry);
  }

  entry.refCount++;
  const e = entry;
  let stickyTop = 0;
  let lastAppliedPhase: StickyPhase | null = null;

  const applyBefore = (): void => {
    stickyEl.style.position = e.originalStyles.position;
    stickyEl.style.top = e.originalStyles.top;
    stickyEl.style.left = e.originalStyles.left;
    stickyEl.style.width = e.originalStyles.width;
    stickyEl.style.margin = e.originalStyles.margin;
  };

  const applyDuring = (): void => {
    stickyEl.style.position = "fixed";
    stickyEl.style.top = `${stickyTop}px`;
    stickyEl.style.left = `${e.rect.left}px`;
    stickyEl.style.width = `${e.rect.width}px`;
    stickyEl.style.margin = "0";
  };

  const applyAfter = (): void => {
    stickyEl.style.position = "absolute";
    stickyEl.style.top = `${e.distance}px`;
    stickyEl.style.left = "0px";
    stickyEl.style.width = `${e.rect.width}px`;
    stickyEl.style.margin = "0";
  };

  return {
    get naturalDocTop() {
      return e.docTop;
    },
    setDistance(distancePx: number) {
      e.distance = Math.max(0, distancePx);
      e.spacer.style.height = `${e.rect.height + e.distance}px`;
      lastAppliedPhase = null;
    },
    setStickyTop(topPx: number) {
      stickyTop = topPx;
      lastAppliedPhase = null;
    },
    setPhase(phase: StickyPhase) {
      // Every scroll event re-derives the same phase while steadily inside "during" - a real
      // fast/fling scroll can fire many native "scroll" events per rendered frame, and
      // rewriting position/top/left/width/margin to the SAME values on every one of them forces
      // repeated style recalculation on the stuck element for no visual change, which reads as
      // jitter under fast scrolling. `setStickyTop`/`setDistance` (the only things that can
      // change what a given phase should render) reset this so a genuine change is never missed.
      if (phase === lastAppliedPhase) return;
      lastAppliedPhase = phase;
      if (phase === "before") applyBefore();
      else if (phase === "during") applyDuring();
      else applyAfter();
    },
    revert() {
      e.refCount--;
      if (e.refCount > 0) return;

      stickyEl.style.position = e.originalStyles.position;
      stickyEl.style.top = e.originalStyles.top;
      stickyEl.style.left = e.originalStyles.left;
      stickyEl.style.width = e.originalStyles.width;
      stickyEl.style.margin = e.originalStyles.margin;
      stickyEl.style.transform = e.originalStyles.transform;

      e.spacer.parentNode?.insertBefore(stickyEl, e.spacer);
      e.spacer.remove();
      stickyCache.delete(stickyEl);
    },
  };
}
