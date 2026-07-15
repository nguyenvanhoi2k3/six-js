export type PinPhase = "before" | "during" | "after";

export interface PinHandle {
  /** The pinned element's natural (unpinned) document-absolute top - callers use this to compute the correct fixed-position offset (see setPinnedTop). */
  readonly naturalDocTop: number;
  /** Reserves scroll distance in the spacer for the pinned duration (on top of the element's own natural size). */
  setDistance(distancePx: number): void;
  /** The viewport-relative `top` to use while pinned (`position: fixed`) - NOT always 0. For a trigger pinned via e.g. "center center", the element must stay wherever it naturally sat in the viewport when the pin started, not snap to the top edge. */
  setPinnedTop(topPx: number): void;
  setPhase(phase: PinPhase): void;
  revert(): void;
}

interface PinCacheEntry {
  spacer: HTMLElement;
  refCount: number;
  rect: DOMRect;
  /** rect.top + the scroll position at setup time - the element's natural top in DOCUMENT (not viewport) coordinates. */
  docTop: number;
  distance: number;
  originalStyles: { position: string; top: string; left: string; width: string; margin: string; transform: string };
}

// Cached per pinned element (not per ScrollTrigger) - multiple triggers pinning the same element
// share one spacer, reference-counted, matching GSAP's approach: we don't want N spacers for one
// element just because N ScrollTriggers happen to target it.
const pinCache = new WeakMap<HTMLElement, PinCacheEntry>();

export function setupPin(pinEl: HTMLElement): PinHandle {
  let entry = pinCache.get(pinEl);

  if (!entry) {
    const rect = pinEl.getBoundingClientRect();
    const computed = getComputedStyle(pinEl);

    const spacer = document.createElement("div");
    spacer.style.position = "relative";
    spacer.style.width = `${rect.width}px`;
    spacer.style.height = `${rect.height}px`;

    pinEl.parentNode!.insertBefore(spacer, pinEl);
    spacer.appendChild(pinEl);

    entry = {
      spacer,
      refCount: 0,
      rect,
      docTop: rect.top + window.scrollY,
      distance: 0,
      originalStyles: {
        position: pinEl.style.position,
        top: pinEl.style.top,
        left: pinEl.style.left,
        width: pinEl.style.width,
        margin: computed.margin,
        transform: pinEl.style.transform,
      },
    };
    pinCache.set(pinEl, entry);
  }

  entry.refCount++;
  const e = entry;
  let pinnedTop = 0;

  const applyBefore = (): void => {
    pinEl.style.position = e.originalStyles.position;
    pinEl.style.top = e.originalStyles.top;
    pinEl.style.left = e.originalStyles.left;
    pinEl.style.width = e.originalStyles.width;
    pinEl.style.margin = e.originalStyles.margin;
  };

  const applyDuring = (): void => {
    pinEl.style.position = "fixed";
    pinEl.style.top = `${pinnedTop}px`;
    pinEl.style.left = `${e.rect.left}px`;
    pinEl.style.width = `${e.rect.width}px`;
    pinEl.style.margin = "0";
  };

  const applyAfter = (): void => {
    pinEl.style.position = "absolute";
    pinEl.style.top = `${e.distance}px`;
    pinEl.style.left = "0px";
    pinEl.style.width = `${e.rect.width}px`;
    pinEl.style.margin = "0";
  };

  return {
    get naturalDocTop() {
      return e.docTop;
    },
    setDistance(distancePx: number) {
      e.distance = Math.max(0, distancePx);
      e.spacer.style.height = `${e.rect.height + e.distance}px`;
    },
    setPinnedTop(topPx: number) {
      pinnedTop = topPx;
    },
    setPhase(phase: PinPhase) {
      if (phase === "before") applyBefore();
      else if (phase === "during") applyDuring();
      else applyAfter();
    },
    revert() {
      e.refCount--;
      if (e.refCount > 0) return;

      pinEl.style.position = e.originalStyles.position;
      pinEl.style.top = e.originalStyles.top;
      pinEl.style.left = e.originalStyles.left;
      pinEl.style.width = e.originalStyles.width;
      pinEl.style.margin = e.originalStyles.margin;
      pinEl.style.transform = e.originalStyles.transform;

      e.spacer.parentNode?.insertBefore(pinEl, e.spacer);
      e.spacer.remove();
      pinCache.delete(pinEl);
    },
  };
}
