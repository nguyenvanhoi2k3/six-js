import { isCssMathExpression, parseNumeric, PropertyHandler, resolveCssMathExpression, resolveHandler } from "../animate/registry";
import { interpolateColor, parseColor, RGBA } from "../animate/color";
import { canInterpolateComplex, interpolateComplexString } from "../animate/complex-string";
import { convertToPx } from "../animate/unit-convert";
import { getTransformCache } from "../animate/transform-cache";

export type TweenMode = "to" | "from" | "fromTo";

interface StringHandler {
  get(target: Element): string;
  set(target: Element, value: string): void;
}

export interface NumericTrack {
  kind: "numeric";
  target: Element;
  prop: string;
  isTransform: boolean;
  handler: Extract<PropertyHandler, { kind: "numeric" }>;
  start: number;
  change: number;
  unit: string;
}

export interface ColorTrack {
  kind: "color";
  target: Element;
  prop: string;
  isTransform: false;
  handler: Extract<PropertyHandler, { kind: "color" }>;
  start: RGBA;
  end: RGBA;
}

export interface ComplexTrack {
  kind: "complex";
  target: Element;
  prop: string;
  isTransform: false;
  handler: StringHandler;
  start: string;
  end: string;
}

export interface DiscreteTrack {
  kind: "discrete";
  target: Element;
  prop: string;
  isTransform: false;
  handler: StringHandler;
  start: string;
  end: string;
}

export type PropertyTrack = NumericTrack | ColorTrack | ComplexTrack | DiscreteTrack;

const RESERVED_KEYS = new Set([
  "duration",
  "ease",
  "delay",
  "repeat",
  "repeatDelay",
  "boomerang",
  "paused",
  "overwrite",
  "onStart",
  "onUpdate",
  "onComplete",
  "onRepeat",
  "onReverseComplete",
]);

const RELATIVE_RE = /^([+\-*/])=(-?[\d.]+)$/;

function resolveRelative(current: number, raw: string): number | null {
  const m = raw.match(RELATIVE_RE);
  if (!m) return null;
  const delta = parseFloat(m[2]);
  switch (m[1]) {
    case "+":
      return current + delta;
    case "-":
      return current - delta;
    case "*":
      return current * delta;
    case "/":
      return current / delta;
    default:
      return current;
  }
}

export function collectPropertyKeys(vars: Record<string, unknown>, fromVars?: Record<string, unknown>): string[] {
  const keys = new Set<string>();
  for (const k in vars) if (!RESERVED_KEYS.has(k)) keys.add(k);
  if (fromVars) for (const k in fromVars) if (!RESERVED_KEYS.has(k)) keys.add(k);
  return [...keys];
}

// A `calc()`/`min()`/`max()`/`clamp()` end/start value can't be parsed by `parseNumeric` as-is
// (it's not a plain `value+unit` pair) - resolve it to its actual computed pixel value first, via
// the browser's own CSS engine, so it flows through the exact same numeric path as any other
// length from here on (interpolated smoothly, not degraded to a start/end discrete snap).
function resolveMathRaw(target: Element, prop: string, isTransform: boolean, raw: unknown): unknown {
  if (isTransform || typeof raw !== "string" || !isCssMathExpression(raw)) return raw;
  return resolveCssMathExpression(target, prop, raw);
}

function buildNumericTrack(target: Element, prop: string, handler: Extract<PropertyHandler, { kind: "numeric" }>, rawStart: unknown, rawEnd: unknown): NumericTrack {
  const current = handler.get(target);
  rawStart = resolveMathRaw(target, prop, handler.isTransform, rawStart);
  rawEnd = resolveMathRaw(target, prop, handler.isTransform, rawEnd);

  let startVal: number;
  let startUnit: string;
  if (rawStart === undefined) {
    startVal = current.value;
    startUnit = current.unit || handler.defaultUnit;
  } else if (typeof rawStart === "string" && RELATIVE_RE.test(rawStart)) {
    startVal = resolveRelative(current.value, rawStart)!;
    startUnit = current.unit || handler.defaultUnit;
  } else {
    const parsed = parseNumeric(rawStart as string | number, handler.defaultUnit);
    startVal = parsed.value;
    startUnit = parsed.unit;
  }

  let endVal: number;
  let endUnit: string;
  if (rawEnd === undefined) {
    endVal = current.value;
    endUnit = current.unit || handler.defaultUnit;
  } else if (typeof rawEnd === "string" && RELATIVE_RE.test(rawEnd)) {
    endVal = resolveRelative(startVal, rawEnd)!;
    endUnit = startUnit;
  } else {
    const parsed = parseNumeric(rawEnd as string | number, handler.defaultUnit);
    endVal = parsed.value;
    endUnit = parsed.unit;
  }

  if (!handler.isTransform && endUnit !== startUnit) {
    startVal = convertToPx(target, prop, startVal, startUnit);
    endVal = convertToPx(target, prop, endVal, endUnit);
    startUnit = "px";
    endUnit = "px";
  }

  return { kind: "numeric", target, prop, isTransform: handler.isTransform, handler, start: startVal, change: endVal - startVal, unit: endUnit };
}

function buildColorTrack(target: Element, prop: string, handler: Extract<PropertyHandler, { kind: "color" }>, rawStart: unknown, rawEnd: unknown): ColorTrack {
  const start = rawStart !== undefined ? parseColor(String(rawStart)) : handler.get(target);
  const end = rawEnd !== undefined ? parseColor(String(rawEnd)) : handler.get(target);
  return { kind: "color", target, prop, isTransform: false, handler, start, end };
}

function buildComplexOrDiscreteTrack(target: Element, prop: string, handler: StringHandler, rawStart: unknown, rawEnd: unknown): ComplexTrack | DiscreteTrack {
  const start = rawStart !== undefined ? String(rawStart) : handler.get(target);
  const end = rawEnd !== undefined ? String(rawEnd) : handler.get(target);

  if (canInterpolateComplex(start, end)) {
    return { kind: "complex", target, prop, isTransform: false, handler, start, end };
  }
  // structurally incompatible strings (different token shapes) can't be smoothly interpolated -
  // degrade to a discrete swap using the same get/set.
  return { kind: "discrete", target, prop, isTransform: false, handler, start, end };
}

function buildDiscreteTrack(target: Element, prop: string, handler: StringHandler, rawStart: unknown, rawEnd: unknown): DiscreteTrack {
  const start = rawStart !== undefined ? String(rawStart) : handler.get(target);
  const end = rawEnd !== undefined ? String(rawEnd) : handler.get(target);
  return { kind: "discrete", target, prop, isTransform: false, handler, start, end };
}

function buildTrack(target: Element, prop: string, handler: PropertyHandler, rawStart: unknown, rawEnd: unknown): PropertyTrack {
  if (handler.kind === "numeric") return buildNumericTrack(target, prop, handler, rawStart, rawEnd);
  if (handler.kind === "color") return buildColorTrack(target, prop, handler, rawStart, rawEnd);
  if (handler.kind === "complex") return buildComplexOrDiscreteTrack(target, prop, handler, rawStart, rawEnd);
  return buildDiscreteTrack(target, prop, handler, rawStart, rawEnd);
}

// "scale" has no transform-cache field of its own (only the independent "scaleX"/"scaleY" do) -
// it's a shorthand that expands into both, each getting its own track (and its own overwrite
// tracking by `prop`), so a later tween touching only "scaleX" can still surgically overwrite
// just that half via "auto".
export const SCALE_EXPANSION: Record<string, string[]> = { scale: ["scaleX", "scaleY"] };

export function buildTracks(targets: readonly Element[], vars: Record<string, unknown>, mode: TweenMode, fromVars?: Record<string, unknown>): PropertyTrack[] {
  const keys = collectPropertyKeys(vars, fromVars);
  const tracks: PropertyTrack[] = [];

  for (const target of targets) {
    for (const key of keys) {
      let rawStart: unknown;
      let rawEnd: unknown;

      if (mode === "to") {
        rawEnd = vars[key];
      } else if (mode === "from") {
        rawStart = vars[key];
      } else {
        rawEnd = key in vars ? vars[key] : undefined;
        rawStart = fromVars && key in fromVars ? fromVars[key] : undefined;
      }

      for (const propKey of SCALE_EXPANSION[key] ?? [key]) {
        const handler = resolveHandler(target, propKey, rawEnd ?? rawStart);
        tracks.push(buildTrack(target, propKey, handler, rawStart, rawEnd));
      }
    }
  }

  return tracks;
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function applyTrack(track: PropertyTrack, eased: number): void {
  switch (track.kind) {
    case "numeric": {
      const value = round(track.start + track.change * eased);
      if (track.isTransform) {
        getTransformCache(track.target)[track.handler.transformKey!] = value;
      } else {
        track.handler.set(track.target, { value, unit: track.unit });
      }
      return;
    }
    case "color":
      track.handler.set(track.target, interpolateColor(track.start, track.end, eased));
      return;
    case "complex":
      track.handler.set(track.target, interpolateComplexString(track.start, track.end, eased));
      return;
    case "discrete":
      track.handler.set(track.target, eased >= 1 ? track.end : track.start);
      return;
  }
}
