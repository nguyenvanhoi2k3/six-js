import { formatColor, parseColor, RGBA } from "./color";
import { getTransformCache, TransformKey } from "./transform-cache";

export interface ParsedValue {
  value: number;
  unit: string;
}

export interface NumericHandler {
  kind: "numeric";
  isTransform: boolean;
  transformKey?: TransformKey;
  defaultUnit: string;
  get(target: Element): ParsedValue;
  set(target: Element, value: ParsedValue): void;
}

export interface ColorHandler {
  kind: "color";
  get(target: Element): RGBA;
  set(target: Element, value: RGBA): void;
}

export interface ComplexHandler {
  kind: "complex";
  get(target: Element): string;
  set(target: Element, value: string): void;
}

export interface DiscreteHandler {
  kind: "discrete";
  get(target: Element): string;
  set(target: Element, value: string): void;
}

export type PropertyHandler = NumericHandler | ColorHandler | ComplexHandler | DiscreteHandler;

const TRANSFORM_ALIASES: Record<string, TransformKey> = {
  x: "x",
  y: "y",
  z: "z",
  rotate: "rotation",
  rotateX: "rotationX",
  rotateY: "rotationY",
  scaleX: "scaleX",
  scaleY: "scaleY",
  skewX: "skewX",
  skewY: "skewY",
};

// x/y have no separate "xPercent"/"yPercent" property name - a percent-translate (for
// self-relative centering, e.g. -50%) and a px-translate can still both be set on the same axis
// at once, but which cache field a call writes to is decided by the value's own unit rather than
// by a dedicated property name. An explicit "N%" string always routes here.
const PERCENT_TRANSLATE_KEYS: Record<string, TransformKey> = { x: "xPercent", y: "yPercent" };

function isPercentValue(value: unknown): boolean {
  return typeof value === "string" && /%\s*$/.test(value.trim());
}

// A bare "0" (number or "0"/"0px" string) is the one case where the incoming value carries no
// real unit information of its own - it's the origin, equally "0px" or "0%". Anything else
// (a non-zero bare number, e.g. `y: 50`) is unambiguous and always means px, matching how this
// value would read outside a transform property.
function isZeroValue(value: unknown): boolean {
  if (typeof value === "number") return value === 0;
  if (typeof value !== "string") return false;
  const v = value.trim();
  return v === "0" || /^0(px)?$/i.test(v);
}

// Which cache field a percent-translate prop's current *live* offset actually lives in - so a
// bare "0" end value (see isZeroValue) can continue animating whichever field the element is
// actually offset in, instead of always assuming px. This is what makes
// `six.set(el, { y: "120%" })` followed by `six.to(el, { y: 0 })` genuinely return to the
// origin: without this, `y: 0` unconditionally targets the (already-zero) px field, silently
// leaving the "120%" offset in place forever - a real, easy-to-hit footgun, found live from a
// user's exact `y: "120%"` -> `y: 0` reveal animation never returning to rest.
function activePercentField(target: Element, prop: string): TransformKey | undefined {
  const percentKey = PERCENT_TRANSLATE_KEYS[prop];
  if (!percentKey) return undefined;
  const pxKey = TRANSFORM_ALIASES[prop];
  const cache = getTransformCache(target);
  return cache[percentKey] !== 0 && (!pxKey || cache[pxKey] === 0) ? percentKey : undefined;
}

function resolveTransformKey(target: Element, prop: string, sampleValue: unknown): TransformKey | undefined {
  if (prop in PERCENT_TRANSLATE_KEYS) {
    if (isPercentValue(sampleValue)) return PERCENT_TRANSLATE_KEYS[prop];
    if (isZeroValue(sampleValue)) return activePercentField(target, prop) ?? TRANSFORM_ALIASES[prop];
  }
  return TRANSFORM_ALIASES[prop];
}

const ANGLE_TRANSFORM_KEYS = new Set<TransformKey>(["rotation", "rotationX", "rotationY", "skewX", "skewY"]);
const PERCENT_TRANSFORM_KEYS = new Set<TransformKey>(["xPercent", "yPercent"]);

const COLOR_PROPS = new Set(["backgroundColor", "color", "borderColor", "outlineColor", "fill", "stroke", "stopColor"]);

const COMPLEX_PROPS = new Set(["boxShadow", "textShadow", "borderRadius", "clipPath", "filter", "backgroundPosition", "backgroundSize", "objectPosition"]);

const UNITLESS_PROPS = new Set(["opacity", "zIndex", "flexGrow", "flexShrink", "order", "fontWeight"]);

function isNumericLike(value: unknown): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  const v = value.trim();
  return /^[+-]?[\d.]+[a-z%]*$/i.test(v) || /^[+-]=/.test(v);
}

const CSS_MATH_FN_RE = /^(calc|min|max|clamp)\(/i;

/** True for a CSS math function (`calc()`/`min()`/`max()`/`clamp()`) - these can't be parsed as
 * a plain `value+unit` pair (see `parseNumeric`'s regex), but they ARE a single resolvable length,
 * unlike a genuinely discrete string (`"none"`, a keyword, ...) - so a property whose end value is
 * one of these still gets a numeric track, not a snap-at-the-end discrete one; see
 * `resolveCssMathExpression` for how it's turned into an actual number. */
export function isCssMathExpression(value: unknown): boolean {
  return typeof value === "string" && CSS_MATH_FN_RE.test(value.trim());
}

/**
 * Resolves a CSS math expression to its computed pixel value by delegating to the browser's own
 * CSS engine - writes it to `target`'s inline style and reads the resolved value back via
 * `getComputedStyle`, rather than reimplementing CSS's own `calc()`/`min()`/`max()`/`clamp()`
 * evaluation (which would also need to duplicate its `vw`/`vh`/`rem`/`em`/`%` unit resolution).
 * Restores the element's prior inline `cssText` immediately after reading, so the probe write
 * never survives past this synchronous call - no visible flash, since nothing repaints between
 * the write and the restore within the same synchronous task.
 */
export function resolveCssMathExpression(target: Element, prop: string, raw: string): string {
  if (typeof getComputedStyle === "undefined") return raw;
  const el = target as HTMLElement;
  const prevCssText = el.style.cssText;
  (el.style as unknown as Record<string, string>)[prop] = raw;
  const resolved = (getComputedStyle(el) as unknown as Record<string, string>)[prop];
  el.style.cssText = prevCssText;
  return resolved || raw;
}

export function parseNumeric(value: string | number, fallbackUnit = ""): ParsedValue {
  if (typeof value === "number") return { value, unit: fallbackUnit };
  const match = String(value).trim().match(/^([+-]?[\d.]+)([a-z%]*)$/i);
  if (!match) return { value: 0, unit: fallbackUnit };
  return { value: parseFloat(match[1]), unit: match[2] || fallbackUnit };
}

function styleValue(target: Element, prop: string): string {
  const inline = (target as HTMLElement).style?.[prop as never] as unknown as string;
  if (inline) return inline;
  if (typeof getComputedStyle === "undefined") return "";
  return (getComputedStyle(target as HTMLElement) as unknown as Record<string, string>)[prop] || "";
}

function transformHandler(key: TransformKey): NumericHandler {
  const defaultUnit = ANGLE_TRANSFORM_KEYS.has(key) ? "deg" : PERCENT_TRANSFORM_KEYS.has(key) ? "%" : "px";
  return {
    kind: "numeric",
    isTransform: true,
    transformKey: key,
    defaultUnit,
    get(target) {
      return { value: getTransformCache(target)[key], unit: defaultUnit };
    },
    set(target, value) {
      getTransformCache(target)[key] = value.value;
    },
  };
}

function colorHandler(prop: string): ColorHandler {
  return {
    kind: "color",
    get(target) {
      return parseColor(styleValue(target, prop) || "rgba(0,0,0,0)");
    },
    set(target, value) {
      (target as HTMLElement).style[prop as never] = formatColor(value) as never;
    },
  };
}

function complexHandler(prop: string): ComplexHandler {
  return {
    kind: "complex",
    get(target) {
      return styleValue(target, prop);
    },
    set(target, value) {
      (target as HTMLElement).style[prop as never] = value as never;
    },
  };
}

function cssVariableHandler(prop: string, sampleValue: unknown): PropertyHandler {
  const current = typeof getComputedStyle !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue(prop).trim() : "";

  if (isNumericLike(sampleValue) || isNumericLike(current)) {
    return {
      kind: "numeric",
      isTransform: false,
      defaultUnit: "",
      get(target) {
        return parseNumeric(getComputedStyle(target as HTMLElement).getPropertyValue(prop).trim());
      },
      set(target, value) {
        (target as HTMLElement).style.setProperty(prop, `${value.value}${value.unit}`);
      },
    };
  }

  return {
    kind: "discrete",
    get(target) {
      return getComputedStyle(target as HTMLElement).getPropertyValue(prop).trim();
    },
    set(target, value) {
      (target as HTMLElement).style.setProperty(prop, value);
    },
  };
}

function genericStyleHandler(prop: string, sampleValue: unknown): PropertyHandler {
  const unit = UNITLESS_PROPS.has(prop) ? "" : "px";

  if (isNumericLike(sampleValue) || isCssMathExpression(sampleValue)) {
    return {
      kind: "numeric",
      isTransform: false,
      defaultUnit: unit,
      get(target) {
        const raw = styleValue(target, prop);
        return isNumericLike(raw) ? parseNumeric(raw, unit) : { value: 0, unit };
      },
      set(target, value) {
        (target as HTMLElement).style[prop as never] = (unit === "" ? `${value.value}` : `${value.value}${value.unit}`) as never;
      },
    };
  }

  return {
    kind: "discrete",
    get(target) {
      return styleValue(target, prop);
    },
    set(target, value) {
      (target as HTMLElement).style[prop as never] = value as never;
    },
  };
}

function attributeHandler(prop: string, sampleValue: unknown): PropertyHandler {
  const numeric = isNumericLike(sampleValue);
  if (numeric) {
    return {
      kind: "numeric",
      isTransform: false,
      defaultUnit: "",
      get(target) {
        return parseNumeric(target.getAttribute(prop) ?? "0");
      },
      set(target, value) {
        target.setAttribute(prop, String(value.value));
      },
    };
  }
  return {
    kind: "discrete",
    get(target) {
      return target.getAttribute(prop) ?? "";
    },
    set(target, value) {
      target.setAttribute(prop, value);
    },
  };
}

function plainPropertyHandler(prop: string, sampleValue: unknown): PropertyHandler {
  if (isNumericLike(sampleValue)) {
    return {
      kind: "numeric",
      isTransform: false,
      defaultUnit: "",
      get(target) {
        return { value: Number((target as unknown as Record<string, unknown>)[prop]) || 0, unit: "" };
      },
      set(target, value) {
        (target as unknown as Record<string, unknown>)[prop] = value.value;
      },
    };
  }
  return {
    kind: "discrete",
    get(target) {
      return String((target as unknown as Record<string, unknown>)[prop] ?? "");
    },
    set(target, value) {
      (target as unknown as Record<string, unknown>)[prop] = value;
    },
  };
}

/** Resolves how to read/write `prop` on `target`. `sampleValue` (the end value from tween vars) helps decide numeric vs discrete when the current DOM state alone is ambiguous (e.g. `width: "auto"` animating to `200`). */
export function resolveHandler(target: Element, prop: string, sampleValue?: unknown): PropertyHandler {
  const transformKey = resolveTransformKey(target, prop, sampleValue);
  if (transformKey) return transformHandler(transformKey);

  if (COLOR_PROPS.has(prop)) return colorHandler(prop);
  if (COMPLEX_PROPS.has(prop)) return complexHandler(prop);
  if (prop.startsWith("--")) return cssVariableHandler(prop, sampleValue);

  const style = (target as HTMLElement).style;
  if (style && prop in style) return genericStyleHandler(prop, sampleValue);

  // Only a genuine plain number property (scrollTop, currentTime, volume, ...) is handled by
  // direct field assignment - an existing-but-non-numeric property (e.g. SVGAnimatedLength
  // objects like `cx`/`cy` on SVG shapes) falls through to setAttribute instead, since naively
  // overwriting such an object with a raw number would be wrong.
  if (prop in target && typeof (target as unknown as Record<string, unknown>)[prop] === "number") {
    return plainPropertyHandler(prop, sampleValue ?? (target as unknown as Record<string, unknown>)[prop]);
  }

  if (typeof target.setAttribute === "function") return attributeHandler(prop, sampleValue);

  return plainPropertyHandler(prop, sampleValue);
}
