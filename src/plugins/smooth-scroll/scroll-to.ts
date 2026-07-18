import { Scroller } from "../on-scroll/observer";

export type ScrollToTarget = number | string | Element;

export interface ScrollTargetContext {
  axis: "x" | "y";
  scroller: Scroller;
  currentScroll: number;
  limit: number;
}

function axisOf(rect: { top: number; left: number }, axis: "x" | "y"): number {
  return axis === "y" ? rect.top : rect.left;
}

/**
 * Resolves a scrollTo() target to an absolute scroll-position pixel value, unclamped - the
 * caller clamps to [0, limit] uniformly (see smooth-scroll.ts), so every target shape goes
 * through the same clamp regardless of how it was resolved. Returns null when a string/selector
 * target can't be found, so the caller can warn and no-op instead of silently scrolling to NaN.
 *
 * Ported from Lenis's own Lenis.scrollTo() (packages/core/src/lenis.ts) rather than invented:
 * - keyword handling ("top"/"start"/"#" -> 0, "bottom"/"end" -> limit, before offset)
 * - CSS `scroll-margin-*`/`scroll-padding-*` accounting, matching native scrollIntoView
 *   semantics (e.g. a sticky header reserving space via scroll-padding-top on the scroller)
 * - nested-scroller offset correction: an element's getBoundingClientRect() is always
 *   viewport-relative, so scrolling a nested container (not window) needs the container's own
 *   rect subtracted out to land on the right spot within it
 */
export function resolveScrollTarget(target: ScrollToTarget, offset: number, ctx: ScrollTargetContext): number | null {
  const { axis, scroller, currentScroll, limit } = ctx;

  if (typeof target === "number") return target + offset;

  if (typeof target === "string" && ["top", "left", "start", "#"].includes(target)) return offset;
  if (typeof target === "string" && ["bottom", "right", "end"].includes(target)) return limit + offset;

  let node: Element;
  if (typeof target === "string") {
    const found = target.startsWith("#") ? document.getElementById(target.slice(1)) : document.querySelector(target);
    if (!found) {
      console.warn(`[six] smoothScroll: scrollTo target "${target}" not found`);
      return null;
    }
    node = found;
  } else {
    node = target;
  }

  let adjustedOffset = offset;
  if (scroller !== window) {
    const wrapperRect = (scroller as Element).getBoundingClientRect();
    adjustedOffset -= axisOf(wrapperRect, axis);
  }

  const rect = node.getBoundingClientRect();
  const nodeStyle = getComputedStyle(node);
  const scrollMargin = parseFloat(axis === "y" ? nodeStyle.scrollMarginTop : nodeStyle.scrollMarginLeft);

  const rootElement = scroller === window ? document.documentElement : (scroller as Element);
  const rootStyle = getComputedStyle(rootElement);
  const scrollPadding = parseFloat(axis === "y" ? rootStyle.scrollPaddingTop : rootStyle.scrollPaddingLeft);

  return (
    axisOf(rect, axis) +
    currentScroll -
    (Number.isNaN(scrollMargin) ? 0 : scrollMargin) -
    (Number.isNaN(scrollPadding) ? 0 : scrollPadding) +
    adjustedOffset
  );
}
