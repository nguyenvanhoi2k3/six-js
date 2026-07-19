export interface PointerPosition {
  /** Normalized -1..1, left edge to right edge of the viewport. */
  nx: number;
  /** Normalized -1..1, top edge to bottom edge of the viewport. */
  ny: number;
}

let current: PointerPosition = { nx: 0, ny: 0 };
let refCount = 0;

function handlePointerMove(e: MouseEvent): void {
  current = {
    nx: (e.clientX / window.innerWidth) * 2 - 1,
    ny: (e.clientY / window.innerHeight) * 2 - 1,
  };
}

/**
 * Shared, refcounted window `mousemove` tracker - exactly one native listener total, no matter how
 * many `parallax()` instances are running at once. Modeled on `on-scroll/observer.ts`'s
 * `addResizeListener`/`removeResizeListener` (lazy-attach on first use, detach on last release),
 * NOT `sticky.ts`'s per-element `WeakMap` cache - a mouse position is one single global resource,
 * not something keyed per DOM element.
 *
 * Deliberately poll-based (`getPointerPosition()`), not push-based (no stored subscriber
 * callbacks) - a real divergence from `addResizeListener`'s shape despite being modeled on it, not
 * an oversight: every `parallax()` instance already ticks every frame via its own `ticker`
 * listener and can just read the current position there, so there's nothing worth notifying on
 * every individual mousemove.
 */
export function acquirePointer(): void {
  refCount++;
  if (refCount === 1 && typeof window !== "undefined") {
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
  }
}

/** Pairs with `acquirePointer()`. Detaches the native listener once the last instance releases, and resets the tracked position so a later fresh acquire starts centered instead of resuming from a stale pre-teardown position. */
export function releasePointer(): void {
  if (refCount === 0) return;
  refCount--;
  if (refCount === 0 && typeof window !== "undefined") {
    window.removeEventListener("mousemove", handlePointerMove);
    current = { nx: 0, ny: 0 };
  }
}

export function getPointerPosition(): PointerPosition {
  return current;
}
