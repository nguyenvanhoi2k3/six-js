// Line-mode delta multiplier (WheelEvent.deltaMode === 1) - browsers report "3 lines" rather
// than a pixel value, so a fixed px-per-line estimate is needed to bring it in line with
// pixel-mode. Verified against Lenis's own virtual-scroll.ts (`LINE_HEIGHT = 100 / 6`) rather
// than invented - matches Firefox's own default line-scroll amount closely enough in practice.
const LINE_HEIGHT = 100 / 6;

export interface NormalizedWheel {
  deltaX: number;
  deltaY: number;
}

/**
 * WheelEvent.deltaMode (rare outside Firefox, which defaults to line-mode) changes what
 * `deltaX`/`deltaY` are measured IN, not just their scale:
 * - 0 (DOM_DELTA_PIXEL): already pixels, by far the most common - most browsers, every trackpad.
 * - 1 (DOM_DELTA_LINE): a count of lines - multiply by an estimated line height.
 * - 2 (DOM_DELTA_PAGE): a count of pages - multiply by the relevant viewport dimension.
 * Treating a line/page count as if it were already pixels (skipping this conversion) makes
 * Firefox's default mouse-wheel scrolling either barely move anything or, worse, feel like an
 * entirely different (much slower) speed than Chrome for the exact same physical wheel tick.
 */
function deltaMultiplier(deltaMode: number, viewportSize: number): number {
  if (deltaMode === 1) return LINE_HEIGHT;
  if (deltaMode === 2) return viewportSize;
  return 1;
}

/** Normalizes a raw WheelEvent's delta into pixels-per-axis, applying `multiplier` on top. */
export function normalizeWheel(event: WheelEvent, viewportWidth: number, viewportHeight: number, multiplier = 1): NormalizedWheel {
  return {
    deltaX: event.deltaX * deltaMultiplier(event.deltaMode, viewportWidth) * multiplier,
    deltaY: event.deltaY * deltaMultiplier(event.deltaMode, viewportHeight) * multiplier,
  };
}
