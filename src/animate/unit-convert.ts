const HORIZONTAL_PROP_RE = /^(left|right|width|x|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)$/i;

function isHorizontalProp(prop: string): boolean {
  return HORIZONTAL_PROP_RE.test(prop);
}

/**
 * Converts `value unit` to an equivalent px number for a given target/property, via
 * measurement (root/element font-size, viewport size, parent box size) rather than a fixed
 * ratio, read directly through the CSSOM/layout APIs instead of a temporary probe element.
 * `%` conversion needs a real laid-out parent
 * (`clientWidth`/`clientHeight`) and so only produces a meaningful (non-zero) result in a real
 * browser - jsdom does not implement layout.
 */
export function convertToPx(target: Element, prop: string, value: number, unit: string): number {
  if (!unit || unit === "px") return value;
  if (unit === "deg" || unit === "rad" || unit === "turn") return value; // not measurable via layout

  if (unit === "rem") {
    const root = typeof document !== "undefined" ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;
    return value * root;
  }

  if (unit === "em") {
    const size = typeof getComputedStyle !== "undefined" ? parseFloat(getComputedStyle(target as HTMLElement).fontSize) || 16 : 16;
    return value * size;
  }

  if (unit === "vh") return typeof window !== "undefined" ? (value / 100) * window.innerHeight : value;
  if (unit === "vw") return typeof window !== "undefined" ? (value / 100) * window.innerWidth : value;

  if (unit === "%") {
    const parent = (target as HTMLElement).parentElement;
    if (!parent) return value;
    const size = isHorizontalProp(prop) ? parent.clientWidth : parent.clientHeight;
    return (value / 100) * size;
  }

  return value;
}
