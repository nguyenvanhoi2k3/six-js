export type StaggerFrom = "start" | "end" | "center" | number;

export interface StaggerOptions {
  each: number;
  from?: StaggerFrom;
}

export type StaggerInput = number | StaggerOptions;

/**
 * Per-index extra delay for a staggered set of `total` items. Not a separate primitive - Timeline
 * feeds this straight into each item's own Tween `delay`, so a staggered call is just N ordinary
 * tweens sharing one timeline position (see Timeline.to/from/fromTo).
 */
export function computeStaggerDelay(index: number, total: number, stagger: StaggerInput): number {
  if (typeof stagger === "number") return index * stagger;

  const { each, from = "start" } = stagger;
  let distance: number;

  if (from === "start") distance = index;
  else if (from === "end") distance = total - 1 - index;
  else if (from === "center") distance = Math.abs(index - (total - 1) / 2);
  else distance = Math.abs(index - from);

  return distance * each;
}
