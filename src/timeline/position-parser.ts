export type TimelinePosition = number | string;

export interface PositionContext {
  /** Where a child with no explicit position would land (the sequential cursor, or "now" for the root - see Timeline). */
  end: number;
  /** Start time of the most recently added child ("<"). */
  prevStart: number;
  /** End time of the most recently added child (">"). */
  prevEnd: number;
  getLabel(name: string): number | undefined;
}

function applySign(sign: string | undefined, num: string | undefined): number {
  if (!sign || num === undefined) return 0;
  const n = parseFloat(num);
  return sign === "-" ? -n : n;
}

const PREV_START_RE = /^<(?:([+-])=([\d.]+))?$/;
const PREV_END_RE = /^>(?:([+-])=([\d.]+))?$/;
const RELATIVE_RE = /^([+-])=([\d.]+)$/;
const LABEL_RE = /^([^\s+\-<>][^+-]*?)(?:([+-])=([\d.]+))?$/;

/**
 * Resolves a GSAP-style timeline position parameter: a number (absolute), "<"/">" (the previously
 * added child's start/end, optionally offset), "+=1"/"-=1" (relative to the timeline's current
 * end/cursor), or a label name (optionally offset). Pure function of a small context object so
 * it's testable without constructing a Timeline.
 */
export function resolvePosition(position: TimelinePosition | undefined, ctx: PositionContext): number {
  if (position === undefined) return ctx.end;
  if (typeof position === "number") return Math.max(0, position);

  const trimmed = position.trim();

  let m = trimmed.match(PREV_START_RE);
  if (m) return Math.max(0, ctx.prevStart + applySign(m[1], m[2]));

  m = trimmed.match(PREV_END_RE);
  if (m) return Math.max(0, ctx.prevEnd + applySign(m[1], m[2]));

  m = trimmed.match(RELATIVE_RE);
  if (m) return Math.max(0, ctx.end + applySign(m[1], m[2]));

  m = trimmed.match(LABEL_RE);
  if (m) {
    const [, label, sign, num] = m;
    const base = ctx.getLabel(label);
    if (base === undefined) {
      console.warn(`[six] timeline: unknown label "${label}", appending at the current end`);
      return ctx.end;
    }
    return Math.max(0, base + applySign(sign, num));
  }

  console.warn(`[six] timeline: invalid position "${position}", appending at the current end`);
  return ctx.end;
}
