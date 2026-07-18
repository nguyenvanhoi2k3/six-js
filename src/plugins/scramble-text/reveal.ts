export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Time-based progress adjusted for a per-unit delay that shares the SAME overall `duration`:
 * pinned at 0 until `delay` elapses, then ramps 0->1 over the remaining time, so every unit -
 * whatever its own delay - still reaches exactly 1 the moment `localTime` reaches `duration`.
 *
 * Two unrelated features reduce to this identical shape, which is why it's shared rather than
 * duplicated: scrambleText's `revealDelay` (GSAP-documented: "the reveal...delayed for a certain
 * portion of the tween...before the reveal begins" - the whole string shares one delay) and the
 * odometer mode's per-character `charStagger` (a six-js addition, not GSAP: each reel gets its
 * OWN delay, `index * charStagger`, so reels start spinning down in a left-to-right wave but all
 * land together at the animation's end instead of the last reel finishing late).
 */
export function delayedProgress(localTime: number, duration: number, delay: number): number {
  if (duration <= delay) return localTime >= duration ? 1 : 0;
  return clamp01((localTime - delay) / (duration - delay));
}
