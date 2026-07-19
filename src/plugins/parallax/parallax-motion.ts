/**
 * Frame-rate-independent exponential damping toward `to` - byte-identical to
 * `smooth-scroll/motion.ts`'s own `damp()` (see that file's doc comment for the full
 * derivation/rationale, verified against Lenis's `maths.ts`). Duplicated locally rather than
 * imported: every one of six-js's published plugin subpaths is built as a fully independent
 * bundle (see CLAUDE.md's Public API/UMD section) specifically so no subpath pays for another's
 * code, and there are zero cross-plugin-folder source imports anywhere in this codebase today
 * (confirmed by grep) - a 3-line pure function isn't worth being the first exception. `lambda` is
 * a decay rate, not the raw 0-1 intensity callers configure - see parallax.ts, which multiplies by
 * 60 to turn a "tuned by feel at 60fps" intensity into a rate independent of the caller's actual
 * frame rate.
 */
export function damp(from: number, to: number, lambda: number, deltaSeconds: number): number {
  return from + (to - from) * (1 - Math.exp(-lambda * deltaSeconds));
}

/**
 * Parses a `sx-parallax-strength` attribute value - same trim -> `Number()` ->
 * fallback-if-not-finite shape as `core/time.ts`'s `parseTimeValue`, minus the `*1000` (this isn't
 * a time value). `"0"` is a real explicit value, not treated as missing; negative numbers are
 * valid and intentionally invert the movement direction (e.g. a background layer drifting opposite
 * the cursor, for a deeper depth illusion).
 */
export function resolveStrength(attr: string | null, fallback: number): number {
  if (attr == null) return fallback;

  const trimmed = attr.trim();
  if (!trimmed) return fallback;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}
